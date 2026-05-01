const BIT_FILES = [
  "Bits/1.gif",
  "Bits/10.gif",
  "Bits/1k.gif",
  "Bits/5k.gif",
  "Bits/10000.gif",
  "Bits/100000.gif"
];

function parseBitValueFromFilename(filePath) {
  const filename = filePath.split("/").pop() || "";
  const stem = filename.replace(/\.gif$/i, "").trim().toLowerCase();
  const normalized = stem.replace(/[,_\s]/g, "");

  if (!normalized) {
    return null;
  }

  if (normalized.endsWith("k")) {
    const value = Number(normalized.slice(0, -1));
    return Number.isFinite(value) ? Math.floor(value * 1000) : null;
  }

  if (normalized.endsWith("m")) {
    const value = Number(normalized.slice(0, -1));
    return Number.isFinite(value) ? Math.floor(value * 1000000) : null;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? Math.floor(value) : null;
}

function deriveBitSize(bits) {
  const scaled = 38 + Math.log10(bits + 1) * 5.4;
  return Math.max(40, Math.min(64, Math.round(scaled)));
}

function buildBitAssets() {
  const assets = BIT_FILES
    .map((file) => {
      const bits = parseBitValueFromFilename(file);

      if (!bits || bits < 1) {
        return null;
      }

      return {
        bits,
        file,
        size: deriveBitSize(bits),
        fallback: bits >= 10
          ? "linear-gradient(180deg, #be9cff 0%, #8b5cf6 42%, #4c1d95 100%)"
          : "linear-gradient(180deg, #edf0f7 0%, #b7becf 45%, #5f6778 100%)"
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.bits - a.bits);

  const uniqueByBits = [];
  const seen = new Set();

  for (const asset of assets) {
    if (seen.has(asset.bits)) {
      continue;
    }

    seen.add(asset.bits);
    uniqueByBits.push(asset);
  }

  return uniqueByBits;
}

const BIT_ORDER = buildBitAssets();
const layer = document.getElementById("bits-layer");
const debugPanel = document.querySelector(".debug-panel");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get("debug") === "0") {
  debugPanel.hidden = true;
}

let imageSupportChecked = false;
const assetSupport = new Map();

function decomposeBits(bitAmount) {
  let remaining = Math.max(0, Math.floor(Number(bitAmount) || 0));
  const pieces = [];

  for (const asset of BIT_ORDER) {
    const count = Math.floor(remaining / asset.bits);

    for (let index = 0; index < count; index += 1) {
      pieces.push(asset);
    }

    remaining -= count * asset.bits;
  }

  return pieces;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function computeGroundY(size) {
  return window.innerHeight - size - 56;
}

function createSparkle(x, y) {
  const burst = document.createElement("div");
  burst.className = "sparkle-burst";
  burst.style.transform = `translate3d(${x - 8}px, ${y - 8}px, 0)`;

  for (let index = 0; index < 8; index += 1) {
    const ray = document.createElement("span");
    ray.style.setProperty("--ray-index", String(index));
    ray.style.setProperty("--ray-distance", String(randomBetween(8, 18).toFixed(1)));
    ray.style.animationDelay = `${index * 18}ms`;
    burst.append(ray);
  }

  layer.append(burst);
  window.setTimeout(() => burst.remove(), 520);
}

function createSparkleForBit(bitElement) {
  const layerRect = layer.getBoundingClientRect();
  const bitRect = bitElement.getBoundingClientRect();
  const sparkleX = bitRect.left - layerRect.left + bitRect.width * 0.5;
  const sparkleY = bitRect.top - layerRect.top + bitRect.height * 0.5;
  createSparkle(sparkleX, sparkleY);
}

function finishBit(bitElement, x, y, rotation, size) {
  bitElement.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
  bitElement.classList.add("is-sparkling");
  createSparkleForBit(bitElement);
  window.setTimeout(() => bitElement.remove(), 220);
}

function animateBit(bitElement, {
  startX,
  groundY,
  size,
  tilt,
  physics
}) {
  if (!bitElement.animate || reducedMotion.matches) {
    finishBit(bitElement, startX, groundY, Number(tilt) * 0.25, size);
    return;
  }

  const minX = 0;
  const maxX = Math.max(0, window.innerWidth - size);
  let x = startX;
  let y = -size - 20;
  let vx = physics.vx;
  let vy = physics.initialVy;
  let rotation = Number(tilt);
  let rotationVelocity = physics.rotationVelocity;
  let bounceCount = 0;
  let touchedGround = false;
  let settleStartedAt = null;
  let finished = false;
  let previousTimestamp = performance.now();
  const startedAt = previousTimestamp;

  const finalize = () => {
    if (finished) {
      return;
    }

    finished = true;
    finishBit(bitElement, x, y, rotation, size);
  };

  const step = (timestamp) => {
    if (finished) {
      return;
    }

    const dt = Math.min(0.033, Math.max(0.008, (timestamp - previousTimestamp) / 1000));
    previousTimestamp = timestamp;

    const airDragFactor = Math.pow(physics.airDrag, dt * 60);
    vx *= airDragFactor;
    rotationVelocity *= Math.pow(physics.angularAirDrag, dt * 60);

    vy += physics.gravity * dt;
    x += vx * dt;
    y += vy * dt;
    rotation += rotationVelocity * dt;

    if (x <= minX || x >= maxX) {
      x = Math.max(minX, Math.min(maxX, x));
      vx *= -0.45;
      rotationVelocity *= 0.88;
    }

    if (y >= groundY) {
      y = groundY;
      touchedGround = true;

      if (Math.abs(vy) > physics.minBounceVelocity && bounceCount < physics.maxBounces) {
        const bounceScale = Math.max(0.42, 1 - bounceCount * 0.16);
        vy = -Math.abs(vy) * physics.restitution * bounceScale;

        if (bounceCount === 0) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          vx = direction * randomBetween(physics.firstBounceKickMin, physics.firstBounceKickMax);
          bitElement.dataset.firstBounceDirection = direction < 0 ? "left" : "right";
          bitElement.dataset.firstBounceKick = String(Math.round(Math.abs(vx)));
        } else {
          vx *= physics.groundFriction;
        }

        rotationVelocity *= physics.angularDamping;
        bounceCount += 1;
        settleStartedAt = null;
      } else {
        vy = 0;
        vx *= 0.82;
        rotationVelocity *= 0.78;

        if (settleStartedAt === null) {
          settleStartedAt = timestamp;
        }

        if (timestamp - settleStartedAt >= physics.settleDelayMs) {
          finalize();
          return;
        }
      }
    }

    bitElement.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;

    if (touchedGround && timestamp - startedAt >= physics.maxLifetimeMs) {
      finalize();
      return;
    }

    window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
}

function spawnBit(asset, delayMs) {
  const size = asset.size;
  const maxX = Math.max(0, window.innerWidth - size - 8);
  const startX = randomBetween(8, maxX);
  const groundY = computeGroundY(size);
  const bitElement = document.createElement("div");
  const tilt = randomBetween(-24, 24).toFixed(1);
  const gravity = randomBetween(1750, 5200);
  const restitution = randomBetween(0.6, 0.86);
  const maxBounces = Math.round(randomBetween(2, 5));
  const physics = {
    gravity,
    vx: randomBetween(-190, 190),
    initialVy: randomBetween(-90, 140),
    restitution,
    airDrag: randomBetween(0.975, 0.993),
    angularAirDrag: randomBetween(0.965, 0.988),
    groundFriction: randomBetween(0.52, 0.84),
    firstBounceKickMin: randomBetween(90, 160),
    firstBounceKickMax: randomBetween(180, 300),
    angularDamping: randomBetween(0.56, 0.84),
    rotationVelocity: randomBetween(-520, 520),
    minBounceVelocity: randomBetween(165, 300),
    maxBounces,
    settleDelayMs: randomBetween(90, 230),
    maxLifetimeMs: randomBetween(3200, 5200)
  };

  bitElement.className = "bit";
  bitElement.style.setProperty("--bit-size", `${size}px`);
  bitElement.style.setProperty("--start-x", `${startX}px`);
  bitElement.style.setProperty("--bit-image", assetSupport.get(asset.file) ? `url("${asset.file}")` : "none");
  bitElement.style.setProperty("--bit-fallback", asset.fallback);
  bitElement.style.setProperty("--fallback-opacity", assetSupport.get(asset.file) ? "0" : "1");
  bitElement.dataset.gravity = String(Math.round(gravity));
  bitElement.dataset.restitution = String(restitution.toFixed(2));
  bitElement.dataset.maxBounces = String(maxBounces);
  layer.append(bitElement);

  window.setTimeout(() => {
    animateBit(bitElement, {
      startX,
      groundY,
      size,
      tilt,
      physics
    });
  }, delayMs);
}

function spawnBits(bitAmount) {
  const pieces = decomposeBits(bitAmount);

  pieces.forEach((asset, index) => {
    spawnBit(asset, index * randomBetween(55, 110));
  });
}

function setAssetFallbackState(filesExist) {
  imageSupportChecked = filesExist;
}

function verifyAssets() {
  const files = BIT_ORDER.map((asset) => asset.file);

  return Promise.all(files.map((file) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = file;
  })));
}

function applyAssetSupport(results) {
  BIT_ORDER.forEach((asset, index) => {
    assetSupport.set(asset.file, Boolean(results[index]));
  });

  setAssetFallbackState(results.every(Boolean));
}

function bindDebugControls() {
  document.querySelectorAll("[data-bits]").forEach((button) => {
    button.addEventListener("click", () => {
      spawnBits(Number(button.dataset.bits));
    });
  });

  document.getElementById("custom-trigger").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    spawnBits(Number(formData.get("bits")));
  });
}

function installExternalTriggers() {
  window.spawnBitsDrop = (bitAmount) => {
    spawnBits(bitAmount);
  };

  window.addEventListener("message", (event) => {
    const payload = event.data;

    if (!payload || typeof payload !== "object") {
      return;
    }

    if (payload.type === "spawnBits" && Number.isFinite(Number(payload.bits))) {
      spawnBits(Number(payload.bits));
    }
  });
}

bindDebugControls();
installExternalTriggers();
verifyAssets().then((results) => {
  applyAssetSupport(results);
});

window.__bitsOverlay = {
  decomposeBits,
  spawnBits
};
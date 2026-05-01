const BIT_ASSETS = {
  purple: {
    bits: 10,
    file: "Bits/10.gif",
    size: 52,
    fallback: "linear-gradient(180deg, #be9cff 0%, #8b5cf6 42%, #4c1d95 100%)"
  },
  grey: {
    bits: 1,
    file: "Bits/1.gif",
    size: 40,
    fallback: "linear-gradient(180deg, #edf0f7 0%, #b7becf 45%, #5f6778 100%)"
  }
};

const BIT_ORDER = [BIT_ASSETS.purple, BIT_ASSETS.grey];
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
  burst.style.transform = `translate3d(${x}px, ${y}px, 0)`;

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

function animateBit(bitElement, { startX, groundY, size, tilt, bounceX, bounceHeight, fallDuration }) {
  const rotationAmount = randomBetween(-180, 180);

  if (!bitElement.animate || reducedMotion.matches) {
    bitElement.style.transform = `translate3d(${startX + bounceX}px, ${groundY}px, 0) rotate(${rotationAmount * 0.2}deg)`;
    bitElement.classList.add("is-sparkling");
    createSparkle(startX + size * 0.32, groundY + size * 0.2);
    window.setTimeout(() => bitElement.remove(), 220);
    return;
  }

  const settleX = startX + bounceX * 0.35;
  const bounceOutX = startX + bounceX;

  const animation = bitElement.animate([
    {
      transform: `translate3d(${startX}px, -${size + 20}px, 0) rotate(0deg)`
    },
    {
      offset: 0.76,
      transform: `translate3d(${startX}px, ${groundY}px, 0) rotate(${tilt}deg)`,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)"
    },
    {
      offset: 0.9,
      transform: `translate3d(${bounceOutX}px, ${groundY - bounceHeight}px, 0) rotate(${rotationAmount}deg)`,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)"
    },
    {
      offset: 1,
      transform: `translate3d(${settleX}px, ${groundY}px, 0) rotate(${rotationAmount * 0.3}deg)`
    }
  ], {
    duration: fallDuration + 420,
    fill: "forwards",
    easing: "linear"
  });

  animation.addEventListener("finish", () => {
    bitElement.classList.add("is-sparkling");
    createSparkle(settleX + size * 0.32, groundY + size * 0.2);
    window.setTimeout(() => bitElement.remove(), 220);
  }, { once: true });
}

function spawnBit(asset, delayMs) {
  const size = asset.size;
  const maxX = Math.max(0, window.innerWidth - size - 8);
  const startX = randomBetween(8, maxX);
  const groundY = computeGroundY(size);
  const bitElement = document.createElement("div");
  const tilt = randomBetween(-24, 24).toFixed(1);
  const bounceX = randomBetween(-48, 48);
  const bounceHeight = randomBetween(16, 42);
  const fallDuration = randomBetween(900, 1450);

  bitElement.className = "bit";
  bitElement.style.setProperty("--bit-size", `${size}px`);
  bitElement.style.setProperty("--start-x", `${startX}px`);
  bitElement.style.setProperty("--bit-image", assetSupport.get(asset.file) ? `url("${asset.file}")` : "none");
  bitElement.style.setProperty("--bit-fallback", asset.fallback);
  bitElement.style.setProperty("--fallback-opacity", assetSupport.get(asset.file) ? "0" : "1");
  layer.append(bitElement);

  window.setTimeout(() => {
    animateBit(bitElement, {
      startX,
      groundY,
      size,
      tilt,
      bounceX,
      bounceHeight,
      fallDuration
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
  const files = Object.values(BIT_ASSETS).map((asset) => asset.file);

  return Promise.all(files.map((file) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = file;
  })));
}

function applyAssetSupport(results) {
  Object.values(BIT_ASSETS).forEach((asset, index) => {
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
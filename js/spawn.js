import { BIT_ORDER } from "./config.js";
import { assetSupport } from "./assets.js";
import { randomBetween, computeGroundY, animateBit } from "./physics.js";
import { finishBit } from "./effects.js";

export function decomposeBits(bitAmount) {
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

export function spawnBit(layer, reducedMotion, asset, delayMs) {
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
    animateBit(
      bitElement,
      { startX, groundY, size, tilt, physics },
      reducedMotion,
      (el, x, y, rotation) => finishBit(layer, el, x, y, rotation)
    );
  }, delayMs);
}

export function spawnBits(layer, reducedMotion, bitAmount) {
  const pieces = decomposeBits(bitAmount);

  pieces.forEach((asset, index) => {
    spawnBit(layer, reducedMotion, asset, index * randomBetween(55, 110));
  });
}

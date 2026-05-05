import { BIT_ORDER, PHYSICS_PRESETS } from "./config.js";
import { assetSupport } from "./assets.js";
import { randomBetween, computeGroundY, animateBit } from "./physics.js";
import { finishBit, createTrail } from "./effects.js";
import { triggerSpawnSound, triggerLandSound } from "./sounds.js";

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

export function spawnBit(layer, reducedMotion, asset, delayMs, preset = PHYSICS_PRESETS.default) {
  const size = asset.size;
  const maxX = Math.max(0, window.innerWidth - size - 8);
  const startX = randomBetween(8, maxX);
  const groundY = computeGroundY(size);
  const bitElement = document.createElement("div");
  const tilt = randomBetween(-24, 24).toFixed(1);
  const gravity = randomBetween(...preset.gravity);
  const restitution = randomBetween(...preset.restitution);
  const maxBounces = Math.round(randomBetween(...preset.maxBounces));
  const physics = {
    gravity,
    vx: randomBetween(...preset.vx),
    initialVy: randomBetween(...preset.initialVy),
    restitution,
    airDrag: randomBetween(...preset.airDrag),
    angularAirDrag: randomBetween(...preset.angularAirDrag),
    groundFriction: randomBetween(...preset.groundFriction),
    firstBounceKickMin: randomBetween(...preset.firstBounceKickMin),
    firstBounceKickMax: randomBetween(...preset.firstBounceKickMax),
    angularDamping: randomBetween(...preset.angularDamping),
    rotationVelocity: randomBetween(...preset.rotationVelocity),
    minBounceVelocity: randomBetween(...preset.minBounceVelocity),
    maxBounces,
    settleDelayMs: randomBetween(...preset.settleDelay),
    maxLifetimeMs: randomBetween(...preset.maxLifetime)
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

  triggerSpawnSound();

  window.setTimeout(() => {
    const trailFn = reducedMotion.matches
      ? null
      : (tx, ty, sz) => createTrail(layer, tx, ty, sz);

    animateBit(
      bitElement,
      { startX, groundY, size, tilt, physics },
      reducedMotion,
      (el, x, y, rotation, sz) => {
        triggerLandSound();
        finishBit(layer, el, x, y, rotation, sz);
      },
      trailFn
    );
  }, delayMs);
}

export function spawnBits(layer, reducedMotion, bitAmount, preset = PHYSICS_PRESETS.default) {
  const pieces = decomposeBits(bitAmount);

  pieces.forEach((asset, index) => {
    spawnBit(layer, reducedMotion, asset, index * randomBetween(55, 110), preset);
  });
}

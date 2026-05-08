import { randomBetween } from "./physics.js";

export function createSparkle(layer, x, y) {
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

export function createSparkleForBit(layer, bitElement) {
  const layerRect = layer.getBoundingClientRect();
  const bitRect = bitElement.getBoundingClientRect();
  const sparkleX = bitRect.left - layerRect.left + bitRect.width * 0.5;
  const sparkleY = bitRect.top - layerRect.top + bitRect.height * 0.5;
  createSparkle(layer, sparkleX, sparkleY);
}

export function createGlowRing(layer, x, y, size) {
  const ring = document.createElement("div");
  ring.className = "glow-ring";
  const ringSize = size * 2;
  ring.style.left = `${x - ringSize * 0.5}px`;
  ring.style.top = `${y - ringSize * 0.5}px`;
  ring.style.width = `${ringSize}px`;
  ring.style.height = `${ringSize}px`;
  layer.append(ring);
  ring.addEventListener("animationend", () => ring.remove(), { once: true });
}

export function createTrail(layer, x, y, size) {
  const trail = document.createElement("div");
  trail.className = "bit-trail";
  const trailSize = Math.max(6, size * 0.32);
  trail.style.left = `${x - trailSize * 0.5}px`;
  trail.style.top = `${y - trailSize * 0.5}px`;
  trail.style.width = `${trailSize}px`;
  trail.style.height = `${trailSize}px`;
  layer.append(trail);
  trail.addEventListener("animationend", () => trail.remove(), { once: true });
}

export function triggerScreenshake(shell, intensity = 0.5) {
  const clamped = Math.min(1, Math.max(0.1, intensity));
  shell.style.setProperty("--shake-scale", String(clamped.toFixed(2)));
  shell.classList.remove("is-shaking");
  void shell.offsetWidth;
  shell.classList.add("is-shaking");
  shell.addEventListener("animationend", () => shell.classList.remove("is-shaking"), { once: true });
}

export function finishBit(layer, bitElement, x, y, rotation, size) {
  bitElement.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
  createSparkleForBit(layer, bitElement);
  const layerRect = layer.getBoundingClientRect();
  const bitRect = bitElement.getBoundingClientRect();
  const cx = bitRect.left - layerRect.left + bitRect.width * 0.5;
  const cy = bitRect.top - layerRect.top + bitRect.height * 0.5;
  createGlowRing(layer, cx, cy, size);
  bitElement.classList.add("is-piled");
  bitElement.addEventListener("animationend", () => bitElement.remove(), { once: true });
}

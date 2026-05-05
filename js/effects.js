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

export function finishBit(layer, bitElement, x, y, rotation) {
  bitElement.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
  bitElement.classList.add("is-sparkling");
  createSparkleForBit(layer, bitElement);
  window.setTimeout(() => bitElement.remove(), 220);
}

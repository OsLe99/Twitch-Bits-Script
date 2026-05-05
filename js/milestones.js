import { triggerScreenshake } from "./effects.js";

const MILESTONES = [100000, 50000, 10000, 5000, 1000];

function formatMilestone(n) {
  if (n >= 1000000) return `${n / 1000000}M`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

function spawnMilestoneBurst(layer, milestone) {
  const burst = document.createElement("div");
  burst.className = "milestone-burst";
  burst.style.setProperty("--milestone-label", `"${formatMilestone(milestone)} Bits!"`);
  layer.append(burst);
  burst.addEventListener("animationend", () => burst.remove(), { once: true });
}

export function checkMilestone(bits, shell, layer) {
  const milestone = MILESTONES.find((t) => bits === t);

  if (!milestone) {
    return false;
  }

  const intensity = Math.min(1, bits / 10000);
  triggerScreenshake(shell, intensity);
  spawnMilestoneBurst(layer, milestone);
  return true;
}

import { verifyAssets, applyAssetSupport } from "./assets.js";
import { spawnBits, decomposeBits } from "./spawn.js";
import { bindDebugControls } from "./debug.js";
import { installExternalTriggers } from "./triggers.js";

const layer = document.getElementById("bits-layer");
const debugPanel = document.querySelector(".debug-panel");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get("debug") === "0") {
  debugPanel.hidden = true;
}

const spawn = (bitAmount) => spawnBits(layer, reducedMotion, bitAmount);

bindDebugControls(spawn);
installExternalTriggers(spawn);

verifyAssets().then((results) => {
  applyAssetSupport(results);
});

window.__bitsOverlay = {
  decomposeBits,
  spawnBits: spawn
};

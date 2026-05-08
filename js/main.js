import { verifyAssets, applyAssetSupport } from "./assets.js";
import { PHYSICS_PRESETS } from "./config.js";
import { decomposeBits, spawnBit, spawnBits } from "./spawn.js";
import { SpawnQueue } from "./queue.js";
import { triggerScreenshake } from "./effects.js";
import { initSounds } from "./sounds.js";
import { checkMilestone } from "./milestones.js";
import { bindDebugControls, updateConnectionStatus } from "./debug.js";
import { installExternalTriggers } from "./triggers.js";
import { connectStreamerBotSocket } from "./websocket.js";

const layer = document.getElementById("bits-layer");
const shell = document.querySelector(".overlay-shell");
const debugPanel = document.querySelector(".debug-panel");
const hudCounter = document.getElementById("bit-counter");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const urlParams = new URLSearchParams(window.location.search);

const isDebugHidden = urlParams.get("debug") === "0";

if (isDebugHidden) {
  debugPanel.hidden = true;

  if (hudCounter) {
    hudCounter.hidden = true;
  }

  const wsStatus = document.getElementById("ws-status");
  if (wsStatus) {
    wsStatus.hidden = true;
  }
}

const presetName = urlParams.get("physics") ?? "default";
let preset = PHYSICS_PRESETS[presetName] ?? PHYSICS_PRESETS.default;

const presetSelect = document.getElementById("physics-preset");

if (presetSelect && PHYSICS_PRESETS[presetName]) {
  presetSelect.value = presetName;
}
const cap = Math.max(1, Number(urlParams.get("cap")) || 15);
const shakeThreshold = 100;

let sessionTotal = 0;

function updateHud(amount) {
  if (!hudCounter || isDebugHidden) return;
  sessionTotal += amount;
  hudCounter.textContent = `${sessionTotal.toLocaleString()} bits`;
}

const queue = new SpawnQueue({
  cap,
  onPiece: (asset, _meta) => spawnBit(layer, reducedMotion, asset, 0, preset)
});

function spawn(bitAmount, meta = {}) {
  const amount = Math.max(0, Math.floor(Number(bitAmount) || 0));

  if (amount <= 0) {
    console.debug("[BitsOverlay] Ignored spawn request with invalid amount:", bitAmount);
    return;
  }

  console.info("[BitsOverlay] Spawning bits:", { bits: amount, meta });

  checkMilestone(amount, shell, layer);

  if (amount >= shakeThreshold && amount < 1000) {
    triggerScreenshake(shell, Math.min(0.5, amount / 500));
  }

  const pieces = decomposeBits(amount);
  queue.enqueue(pieces, meta);
  updateHud(amount);
}

bindDebugControls(
  spawn,
  null,
  (name) => { preset = PHYSICS_PRESETS[name] ?? PHYSICS_PRESETS.default; }
);
installExternalTriggers(spawn);

const wsEndpoint = urlParams.get("endpoint")?.trim() || "ws://127.0.0.1:8080/";
const socket = connectStreamerBotSocket({
  endpoint: wsEndpoint,
  onSpawn: (bitAmount, meta) => spawn(bitAmount, meta),
  onStatusChange: updateConnectionStatus
});

const handleObsVendorEvent = (eventName, event) => {
  if (!event?.detail) {
    return;
  }

  console.debug(`[BitsOverlay][OBS Raw] ${eventName} received:`, event.detail);

  if (event.detail?.eventName === 'spawnBits') {
    const bits = event.detail?.eventData?.bits;
    if (bits) {
      console.info("[BitsOverlay][OBS Raw] spawnBits request:", { bits });
      spawn(bits);
      return;
    }

    console.warn("[BitsOverlay][OBS Raw] spawnBits missing valid bits field:", event.detail);
  }
};

window.addEventListener("obs-event", (event) => handleObsVendorEvent("obs-event", event));
window.addEventListener("obsCustomMessage", (event) => handleObsVendorEvent("obsCustomMessage", event));

verifyAssets().then((results) => {
  applyAssetSupport(results);
});

initSounds();

window.__bitsOverlay = {
  decomposeBits,
  spawnBits: (bitAmount, meta) => spawn(bitAmount, meta),
  spawnBitsDirect: (bitAmount) => spawnBits(layer, reducedMotion, bitAmount, preset),
  queue,
  socket
};

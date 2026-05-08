export function bindDebugControls(onSpawn, onBanner = null, onPresetChange = null) {
  document.querySelectorAll("[data-bits]").forEach((button) => {
    button.addEventListener("click", () => {
      onSpawn(Number(button.dataset.bits));
    });
  });

  document.getElementById("custom-trigger").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSpawn(Number(formData.get("bits")));
  });

  const presetSelect = document.getElementById("physics-preset");

  if (presetSelect && onPresetChange) {
    presetSelect.addEventListener("change", () => {
      onPresetChange(presetSelect.value);
    });
  }
}

const WS_STATUS_LABELS = {
  connecting: "Connecting",
  connected: "Connected",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
  error: "Error"
};

export function updateConnectionStatus(state, detail = "") {
  const root = document.getElementById("ws-status");

  if (!root) {
    return;
  }

  const stateLabel = root.querySelector("[data-role='state-label']");
  const detailLabel = root.querySelector("[data-role='state-detail']");

  root.dataset.state = state;

  if (stateLabel) {
    stateLabel.textContent = WS_STATUS_LABELS[state] ?? state;
  }

  if (detailLabel) {
    detailLabel.textContent = detail || "Waiting for events";
  }
}

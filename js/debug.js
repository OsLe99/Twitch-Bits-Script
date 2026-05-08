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

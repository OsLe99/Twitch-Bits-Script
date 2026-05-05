export function bindDebugControls(onSpawn) {
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
}

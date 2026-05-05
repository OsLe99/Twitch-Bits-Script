export function installExternalTriggers(onSpawn) {
  window.spawnBitsDrop = (bitAmount) => {
    onSpawn(bitAmount);
  };

  window.addEventListener("message", (event) => {
    const payload = event.data;

    if (!payload || typeof payload !== "object") {
      return;
    }

    if (payload.type === "spawnBits" && Number.isFinite(Number(payload.bits))) {
      onSpawn(Number(payload.bits));
    }
  });
}

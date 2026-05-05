export function installExternalTriggers(onSpawn) {
  window.spawnBitsDrop = (bitAmount, meta = {}) => {
    onSpawn(bitAmount, meta);
  };

  window.addEventListener("message", (event) => {
    const payload = event.data;

    if (!payload || typeof payload !== "object") {
      return;
    }

    if (payload.type === "spawnBits" && Number.isFinite(Number(payload.bits))) {
      const { username = "", message = "" } = payload;
      onSpawn(Number(payload.bits), { username, message });
    }
  });
}

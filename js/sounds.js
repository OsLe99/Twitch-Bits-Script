let ctx = null;
const buffers = new Map();

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  return ctx;
}

async function loadSound(url) {
  try {
    const audioCtx = getCtx();
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch {
    return null;
  }
}

function play(key) {
  const buf = buffers.get(key);

  if (!buf) {
    return;
  }

  try {
    const audioCtx = getCtx();
    const source = audioCtx.createBufferSource();
    source.buffer = buf;
    source.connect(audioCtx.destination);
    source.start();
  } catch {
    // Graceful degradation — audio unavailable
  }
}

export async function initSounds() {
  const [spawnBuf, landBuf] = await Promise.all([
    loadSound("assets/sounds/spawn.ogg"),
    loadSound("assets/sounds/land.ogg")
  ]);

  buffers.set("spawn", spawnBuf);
  buffers.set("land", landBuf);
}

export function triggerSpawnSound() {
  play("spawn");
}

export function triggerLandSound() {
  play("land");
}

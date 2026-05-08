export const BIT_FILES = [
  "assets/Bits/1.gif",
  "assets/Bits/10.gif",
  "assets/Bits/1k.gif",
  "assets/Bits/5k.gif",
  "assets/Bits/10000.gif",
  "assets/Bits/100000.gif"
];

export function parseBitValueFromFilename(filePath) {
  const filename = filePath.split("/").pop() || "";
  const stem = filename.replace(/\.gif$/i, "").trim().toLowerCase();
  const normalized = stem.replace(/[,_\s]/g, "");

  if (!normalized) {
    return null;
  }

  if (normalized.endsWith("k")) {
    const value = Number(normalized.slice(0, -1));
    return Number.isFinite(value) ? Math.floor(value * 1000) : null;
  }

  if (normalized.endsWith("m")) {
    const value = Number(normalized.slice(0, -1));
    return Number.isFinite(value) ? Math.floor(value * 1000000) : null;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? Math.floor(value) : null;
}

export function deriveBitSize(bits) {
  const scaled = 38 + Math.log10(bits + 1) * 5.4;
  return Math.max(40, Math.min(64, Math.round(scaled)));
}

export function buildBitAssets() {
  const assets = BIT_FILES
    .map((file) => {
      const bits = parseBitValueFromFilename(file);

      if (!bits || bits < 1) {
        return null;
      }

      return {
        bits,
        file,
        size: deriveBitSize(bits),
        fallback: bits >= 10
          ? "linear-gradient(180deg, #be9cff 0%, #8b5cf6 42%, #4c1d95 100%)"
          : "linear-gradient(180deg, #edf0f7 0%, #b7becf 45%, #5f6778 100%)"
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.bits - a.bits);

  const uniqueByBits = [];
  const seen = new Set();

  for (const asset of assets) {
    if (seen.has(asset.bits)) {
      continue;
    }

    seen.add(asset.bits);
    uniqueByBits.push(asset);
  }

  return uniqueByBits;
}

export const BIT_ORDER = buildBitAssets();

export const PHYSICS_PRESETS = {
  default: {
    gravity:             [1750, 5200],
    vx:                  [-190, 190],
    initialVy:           [-90, 140],
    restitution:         [0.60, 0.86],
    airDrag:             [0.975, 0.993],
    angularAirDrag:      [0.965, 0.988],
    groundFriction:      [0.52, 0.84],
    firstBounceKickMin:  [90, 160],
    firstBounceKickMax:  [180, 300],
    angularDamping:      [0.56, 0.84],
    rotationVelocity:    [-520, 520],
    minBounceVelocity:   [165, 300],
    maxBounces:          [2, 5],
    settleDelay:         [90, 230],
    maxLifetime:         [3200, 5200]
  },
  light: {
    gravity:             [600, 1800],
    vx:                  [-120, 120],
    initialVy:           [-140, 80],
    restitution:         [0.72, 0.94],
    airDrag:             [0.988, 0.998],
    angularAirDrag:      [0.982, 0.997],
    groundFriction:      [0.65, 0.92],
    firstBounceKickMin:  [50, 110],
    firstBounceKickMax:  [110, 200],
    angularDamping:      [0.72, 0.94],
    rotationVelocity:    [-280, 280],
    minBounceVelocity:   [80, 180],
    maxBounces:          [3, 7],
    settleDelay:         [140, 320],
    maxLifetime:         [4500, 7000]
  },
  heavy: {
    gravity:             [4000, 9000],
    vx:                  [-70, 70],
    initialVy:           [-30, 180],
    restitution:         [0.30, 0.55],
    airDrag:             [0.955, 0.974],
    angularAirDrag:      [0.945, 0.968],
    groundFriction:      [0.25, 0.50],
    firstBounceKickMin:  [25, 70],
    firstBounceKickMax:  [70, 130],
    angularDamping:      [0.38, 0.60],
    rotationVelocity:    [-180, 180],
    minBounceVelocity:   [260, 450],
    maxBounces:          [1, 3],
    settleDelay:         [40, 110],
    maxLifetime:         [1800, 3200]
  },
  chaotic: {
    gravity:             [300, 10000],
    vx:                  [-420, 420],
    initialVy:           [-240, 350],
    restitution:         [0.45, 0.99],
    airDrag:             [0.945, 0.999],
    angularAirDrag:      [0.935, 0.999],
    groundFriction:      [0.15, 0.97],
    firstBounceKickMin:  [30, 240],
    firstBounceKickMax:  [250, 520],
    angularDamping:      [0.28, 0.99],
    rotationVelocity:    [-1000, 1000],
    minBounceVelocity:   [60, 380],
    maxBounces:          [2, 9],
    settleDelay:         [40, 320],
    maxLifetime:         [2200, 8000]
  }
};

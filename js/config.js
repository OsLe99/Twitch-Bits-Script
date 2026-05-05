export const BIT_FILES = [
  "Bits/1.gif",
  "Bits/10.gif",
  "Bits/1k.gif",
  "Bits/5k.gif",
  "Bits/10000.gif",
  "Bits/100000.gif"
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

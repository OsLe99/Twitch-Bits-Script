import { BIT_ORDER } from "./config.js";

export const assetSupport = new Map();

let imageSupportChecked = false;

export function setAssetFallbackState(filesExist) {
  imageSupportChecked = filesExist;
}

export function verifyAssets() {
  const files = BIT_ORDER.map((asset) => asset.file);

  return Promise.all(files.map((file) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = file;
  })));
}

export function applyAssetSupport(results) {
  BIT_ORDER.forEach((asset, index) => {
    assetSupport.set(asset.file, Boolean(results[index]));
  });

  setAssetFallbackState(results.every(Boolean));
}

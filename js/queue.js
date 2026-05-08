export class SpawnQueue {
  #pieces = [];
  #timer = null;
  #intervalMs;
  #onPiece;

  constructor({ cap = 15, onPiece }) {
    this.#intervalMs = 1000 / Math.max(1, cap);
    this.#onPiece = onPiece;
  }

  enqueue(pieces, meta = {}) {
    for (const asset of pieces) {
      this.#pieces.push({ asset, meta });
    }

    if (this.#timer === null) {
      this.#drain();
    }
  }

  #drain() {
    if (this.#pieces.length === 0) {
      this.#timer = null;
      return;
    }

    const item = this.#pieces.shift();

    if (item) {
      this.#onPiece(item.asset, item.meta);
    }

    this.#timer = window.setTimeout(() => this.#drain(), this.#intervalMs);
  }

  get size() {
    return this.#pieces.length;
  }

  clear() {
    this.#pieces.length = 0;

    if (this.#timer !== null) {
      window.clearTimeout(this.#timer);
      this.#timer = null;
    }
  }
}

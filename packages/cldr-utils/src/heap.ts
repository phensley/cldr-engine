export type Comparator<T> = (a: T, b: T) => number;

const parent = (i: number) => (i - 1) >> 1;
const left = (i: number) => (i << 1) + 1;
const right = (i: number) => (i << 1) + 2;

/**
 * Minimum heap.
 */
export class Heap<T> {

  private items: T[];

  constructor(readonly cmp: Comparator<T>, data: T[]) {
    this.items = data.slice(0);
    for (let i = parent(data.length - 1); i >= 0; i--) {
      this._down(i);
    }
  }

  /**
   * Is the heap empty?
   */
  empty(): boolean {
    return !this.items.length;
  }

  /**
   * Push an item and sift up.
   */
  push(item: T): void {
    this.items.push(item);
    this._up();
  }

  /**
   * Pop the minimum item.
   */
  pop(): T | undefined {
    if (this.items.length <= 1) {
      return this.items.pop();
    }
    const r = this.items[0];
    this.items[0] = this.items.pop()!;
    this._down();
    return r;
  }

  /**
   * Sift down.
   */
  private _down(i: number = 0): void {
    const len = this.items.length;
    for (; ;) {
      const lx = left(i);
      if (lx >= len) {
        break;
      }
      const rx = right(i);
      const sm = rx < len
        ? (this.cmp(this.items[lx], this.items[rx]) === -1 ? lx : rx)
        : lx;

      if (this.cmp(this.items[sm], this.items[i]) >= 0) {
        break;
      }
      this.swap(sm, i);
      i = sm;
    }
  }

  /**
   * Sift up.
   */
  private _up(): void {
    let i = this.items.length - 1;
    while (i > 0) {
      const px = parent(i);
      if (this.cmp(this.items[i], this.items[px]) !== -1) {
        break;
      }
      this.swap(i, px);
      i = px;
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.items[i];
    this.items[i] = this.items[j];
    this.items[j] = tmp;
  }

}

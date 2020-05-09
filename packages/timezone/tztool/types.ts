export class DefaultArrayMap<T> {
  private elems: { [x: string]: T[] } = {};

  get(key: string): T[] {
    return this.elems[key];
  }

  add(key: string, val: T): T[] {
    let e = this.elems[key];
    if (e === undefined) {
      this.elems[key] = e = [];
    }
    e.push(val);
    return e;
  }

  keys(): string[] {
    return Object.keys(this.elems).sort();
  }
}

export class FrequencySet<T> {
  private elems: T[] = [];
  private freq: Map<T, number> = new Map();

  /**
   * Add an element to the set or update its frequency.
   */
  add(elem: T): void {
    const freq = this.freq.get(elem) || 0;
    if (freq === 0) {
      this.elems.push(elem);
    }
    this.freq.set(elem, freq + 1);
  }

  /**
   * Return the elements, sorted by frequency MOST to LEAST.
   */
  sort(): T[] {
    const res = this.elems.slice();
    res.sort((a: T, b: T) => {
      const fa = this.freq.get(a) || -1;
      const fb = this.freq.get(b) || -1;
      return fb < fa ? -1 : fa === fb ? 0 : 1;
    });
    return res;
  }
}

const pluralValues = ['other', 'zero', 'one', 'two', 'few', 'many'];

export const pluralFields = (key: string) => pluralValues.map((v) => `${key}-count-${v}`);

export const pluralDigit = (n: number): string => {
  let r = '1';
  for (let i = 0; i < n - 1; i++) {
    r += '0';
  }
  return r;
};

// Produces a list of pluralized digits to for long/short formats.
// e.g. 1000-count-zero, 1000-count-one, ..., etc.
export const pluralDigitFields = (() => {
  const res = [];
  for (let i = 1; i <= 15; i++) {
    const base = pluralDigit(i);
    for (const key of pluralFields(base)) {
      res.push(key);
    }
  }
  return res;
})();

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

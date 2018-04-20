
const pluralValues = ['other', 'zero', 'one', 'two', 'few', 'many'];

export const pluralFields = (key: string) => pluralValues.map(v => `${key}-count-${v}`);

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
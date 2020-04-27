/**
 * @internal
 */
export const numarray = (s: string, base: number = 10): number[] =>
  s ? s.split(' ').map(n => parseInt(n, base)) : [];

/**
 * @internal
 */
export const stringToObject = (raw: string, d1: string, d2: string): { [x: string]: string } => {
  const o: { [x: string]: string } = {};
  for (const part of raw.split(d1)) {
    const [k, v] = part.split(d2);
    o[k] = v;
  }
  return o;
};

/**
 * @internal
 */
export const leftPad = (s: number | string, w: number): string => {
  s = typeof s === 'number' ? String(s) : s;
  let d = w - s.length;
  let r = '';
  while (d-- > 0) {
    r += ' ';
  }
  return r + s;
};

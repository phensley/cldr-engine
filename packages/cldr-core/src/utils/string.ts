export const numarray = (s: string, base: number = 10) =>
  s ? s.split(' ').map(n => parseInt(n, base)) : [];

export const stringToObject = (raw: string, d1: string, d2: string): { [x: string]: string } => {
  const o: { [x: string]: string } = {};
  for (const part of raw.split(d1)) {
    const [k, v] = part.split(d2);
    o[k] = v;
  }
  return o;
};

export const leftPad = (s: string | number, w: number): string => {
  s = typeof s === 'number' ? String(s) : s;
  let d = w - s.length;
  let r = '';
  while (d-- > 0) {
    r += ' ';
  }
  return r + s;
};

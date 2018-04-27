export const stringToObject = (raw: string, d1: string, d2: string): { [x: string]: string } => {
  const o: { [x: string]: string } = {};
  for (const part of raw.split(d1)) {
    const [k, v] = part.split(d2);
    o[k] = v;
  }
  return o;
};

const ZEROS = '0000000000';

export const zeroPad2 = (n: number, w: number): string => w === 2 && n < 10 ? `0${n}` : `${n}`;

export const zeropad = (n: number, w: number): string => {
  const neg = n < 0;
  const s = String(Math.abs(n));
  const d = w - s.length - (neg ? 1 : 0);
  let r = neg ? '-' : '';
  if (d <= 0) {
    return r + s;
  }

  let i = (d / 10) | 0;
  const j = d - (i * 10);
  while (i-- > 0) {
    r += ZEROS;
  }
  if (j > 0) {
    r += ZEROS.slice(0, j);
  }
  return r + s;
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

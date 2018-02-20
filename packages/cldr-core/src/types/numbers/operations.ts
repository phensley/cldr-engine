import { DivMod } from './math';
import { Constants, POWERS10  } from './types';

const cmp = (a: number, b: number): number => a < b ? -1 : a === b ? 0 : 1;

export const compare = (a: number[], b: number[], shift: number): number => {
  const div = new DivMod();
  let n = a.length;
  let m = b.length;

  const [q, r] = div.word(shift, Constants.RDIGITS);
  if (r === 0) {
    while (--m >= 0) {
      const c = cmp(a[m + q], b[m]);
      if (c !== 0) {
        return c;
      }
    }
  } else {
    const ph = POWERS10[r];
    let c = 0;
    let hi = 0;
    let loprev = 0;
    let lo = 0;
    --m;
    --n;
    [hi, loprev] = div.pow10(b[m--], Constants.RDIGITS - r);
    if (hi !== 0) {
      c = cmp(a[n], hi);
      if (c !== 0) {
        return c;
      }
      --n;
    }
    let x = 0;
    for (; m >= 0; m--, n--) {
      [hi, lo] = div.pow10(b[m], Constants.RDIGITS - r);
      x = ph * loprev + hi;
      c = cmp(a[n], x);
      if (c !== 0) {
        return c;
      }
      loprev = lo;
    }
    x = ph * loprev;
    c = cmp(a[q], x);
    if (c !== 0) {
      return c;
    }
  }
  return Number(!allzero(a, q));
};

export const allzero = (data: number[], len: number): number => {
  while (--len >= 0) {
    if (data[len] !== 0) {
      return 0;
    }
  }
  return 1;
};

/**
 * Returns the number of digits in w, where w < RADIX.
 */
export const digits = (w: number): number => {
  if (w < Constants.P4) {
    if (w < Constants.P2) {
      return w < Constants.P1 ? 1 : 2;
    }
    return w < Constants.P3 ? 3 : 4;
  }
  if (w < Constants.P6) {
    return w < Constants.P5 ? 5 : 6;
  }
  return w < Constants.P7 ? 7 : 8;
};

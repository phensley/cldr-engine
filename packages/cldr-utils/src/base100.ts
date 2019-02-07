// =====================================================================
// TODO: the base-100 encoder is deprecated and will be removed once the
// new encoding for @phensley/timezone rules is completed.

// Simple base-100 UTF-8-safe encoding of numbers. With 64-bit bitwise
// operations we could do a variable-length encoding of numbers up to
// Number.MAX_SAFE_INTEGER. Since JavaScript's bitwise operations only
// support 32-bit numbers, we do this compromise.

// The minus symbol is reserved to indicate negative numbers, and period is
// reserved in case of future support of encoding floating point numbers.

export const ENCODE = '' +
  '!#$%&()*+,0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '[]^_abcdefghijklmnopqrstuvwxyz{|}~¢£¥¦§©«±µ»¼½¾';

const DECODE = ENCODE.split('').reduce((o: any, ch, i) => {
  o[ch] = i;
  return o;
}, {});

export const base100encode = (orig: number): string => {
  if (orig === 0) {
    return ENCODE[0];
  }
  let res = orig < 0 ? '-' : '';
  let n = Math.abs(orig);
  while (n >= 100) {
    const i = n % 100;
    res += ENCODE[i];
    n = Math.floor(n / 100);
  }
  return n > 0 ? res + ENCODE[n] : res;
};

export const base100decode = (s: string): number => {
  const len = s.length;
  if (len === 0) {
    return 0;
  }
  const lim = s[0] === '-' ? 1 : 0;
  let n = 0;
  for (let i = s.length - 1; i >= lim; i--) {
    const ch = s[i];
    n *= 100;
    n += DECODE[ch];
  }
  return lim === 1 ? -n : n;
};

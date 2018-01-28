// Simple base-100 UTF-8-safe encoding of numbers. With 64-bit bitwise
// operations we could do a variable-length encoding of Javascript's maximum
// safe integer. However, since JavaScript's bitwise operations only support
// 32-bit numbers, we do this compromise.

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

export const bitarrayCreate = (bits: number[]): number[] => {
  const data: number[] = new Array((bits.length >>> 5) + 1);
  for (let i = 0; i < bits.length; i++) {
    const idx = i >>> 5;
    const bit = bits[i];
    if (bit === 0) {
      data[idx] &= ~(1 << i);
    } else {
      data[idx] |= (1 << i);
    }
  }
  return data;
};

export const bitarrayGet = (data: number[], i: number): boolean => {
  const idx = i >>> 5;
  return idx < data.length ? ((data[idx] >>> (i % 32)) & 1) === 1 : false;
};

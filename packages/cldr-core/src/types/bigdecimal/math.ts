import { RADIX, RDIGITS, POWERS10 } from './types';

/**
 * Knuth TAoCP 4.3.1 Algorithm A
 * Addition of nonnegative n-place integers u and v, returning the sum w.
 * Numbers must already be aligned and length u >= length v.
 */
export const add = (u: number[], v: number[]): number[] => {
  const vlen = v.length;
  const n = u.length;
  const w: number[] = new Array(n);

  let j = 0;
  let k = 0;
  while (j < n) {
    const vj = j < vlen ? v[j] : 0;
    const z = u[j] + vj + k;
    w[j] = z % RADIX;
    k = (z / RADIX) | 0;
    j++;
  }
  if (k === 1) {
    w.push(k);
  }
  return w;
};

/**
 * Knuth TAoCP 4.3.1 Algorithm S
 * Subtraction of nonnegative n-place integers u >= v, returning the sum w.
 * Numbers must already be aligned and length u >= length v.
 */
export const subtract = (u: number[], v: number[]): number[] => {
  const vlen = v.length;
  const n = u.length;
  const w: number[] = new Array(n);

  let j = 0;
  let k = 0;
  while (j < n) {
    const vj = j < vlen ? v[j] : 0;
    const z = u[j] - vj + k;
    w[j] = z < 0 ? z + RADIX : z;
    k = z < 0 ? -1 : 0;
    j++;
  }
  return w;
};

/**
 * Knuth TAoCP 4.3.1 Algorithm M
 * Multiplication of nonnegative integers u and v, returning the product w.
 */
export const multiply = (u: number[], v: number[]): number[] => {
  const m = u.length;
  const n = v.length;
  let i = 0;
  let j = 0;
  const w = new Array(n + m);
  w.fill(0);

  for (j = 0; j < n; j++) {
    let k = 0;
    for (i = 0; i < m; i++) {
      const p = (k + w[i + j]) + u[i] * v[j];
      k = (p / RADIX) | 0;
      w[i + j] = p - k * RADIX;
    }
    w[j + m] = k;
  }
  return w;
};

/**
 * Multiplication of a nonnegative integer u by a single word v, returning the product w.
 */
export const multiplyword = (w: number[], u: number[], n: number, v: number): void => {
  let i = 0;
  let k = 0;
  for (i = 0; i < n; i++) {
    const p = (k + u[i] * v);
    k = (p / RADIX) | 0;
    w[i] = p - k * RADIX;
  }
  if (k > 0) {
    w[i] = k;
  }
};

/**
 * Knuth TAoCP 4.3.1 Algorithm D
 * Division of nonnegative integer u by v, returning the quotient q and remainder r.
 */
export const divide = (uc: number[], vc: number[]): [number[], number[]] => {
  const n = vc.length;
  const m = uc.length - n;
  if (n === 1) {
    return divideword(uc, vc[0]);
  }

  const nplusm = n + m;
  if (nplusm < n) {
    throw new Error(`n + m must be >= n, got ${m}`);
  }

  // Storage for copy of u which is modified in place, and v which needs an
  // extra digit.
  const u = uc.slice();
  u.push(0);
  const v = vc.slice();
  v.push(0);

  // Storage for quotient and remainder.
  const q = new Array(nplusm + 1);
  q.fill(0);
  const r = new Array(m);
  r.fill(0);

  // D1. Normalize
  const d = (RADIX / (v[n - 1] + 1)) | 0;
  if (d !== 1) {
    multiplyword(u, uc, nplusm, d);
    multiplyword(v, vc, n, d);
  }

  let k = 0;
  let p = 0;
  let hi = 0;
  let lo = 0;

  let j = m;
  while (j >= 0) {
    // D3. Calculate q̂ and r̂.
    p = u[j + n - 1] + (u[j + n] * RADIX);
    let qhat = (p / v[n - 1]) | 0;
    let rhat = p - qhat * v[n - 1];
    while (true) {
      // D3. Test if q̂ = radix ...
      if (qhat < RADIX) {
        const z = qhat * v[n - 2];
        hi = (z / RADIX) | 0;
        lo = z - hi * RADIX;
        if (hi <= rhat) {
          if (hi !== rhat || lo <= u[j + n - 2]) {
            break;
          }
        }
      }

      // D3. ... decrease q̂ by 1, increase r̂ by v[n - 1]
      qhat--;
      rhat += v[n - 1];
      if (rhat >= RADIX) {
        break;
      }
    }

    // D4. Multiply and subtract.
    let i = 0;
    k = 0;
    for (i = 0; i <= n; i++) {
      // Multiply.
      p = qhat * v[i] + k;
      hi = (p / RADIX) | 0;
      lo = p - hi * RADIX;

      // Subtract and determine carry.
      const x = u[i + j] - lo;
      k = x < 0 ? 1 : 0;
      u[i + j] = k ? x + RADIX : x;
      k += hi;
    }

    // Set the j-th quotient digit
    q[j] = qhat;

    // D5. Test remainder of D4.
    if (k > 0) {
      // D6. Add back. Quotient digit is too large by 1.
      q[j] -= 1;
      _add(u, j, u, j, v, n + 1, n);
    }

    // D7. Loop on j.
    j--;
  }

  // D8. Unnormalize remainder.
  k = 0;
  for (let i = n - 1; i >= 0; i--) {
    p = u[i] + (k * RADIX);
    r[i] = (p / d) | 0;
    k = p - r[i] * d;
  }

  return [q, r];
};

/**
 * Knuth TAoCP 4.3.1 Exercise 16
 * Division of a nonnegative integer u by a single word v, returning the quotient q
 * and remainder r.
 */
const divideword = (u: number[], v: number): [number[], number[]] => {
  const n = u.length;
  const q = new Array(n);
  q.fill(0);
  let r = 0;
  // console.log(`>> ${u} / ${v}`);
  for (let i = n - 1; i >= 0; i--) {
    const p = u[i] + (r * RADIX);
    q[i] = (p / v) | 0;
    r = p - q[i] * v;
  }
  return [q, [r]];
};

/**
 * divide() helper, to add u + v and store the result in w.
 */
const _add = (w: number[], j0: number, u: number[], j1: number, v: number[], m: number, n: number): number => {
  let k = 0;
  let s = 0;
  let i = 0;

  for (i = 0; i < n; i++) {
    s = u[i + j1] + (v[i] + k);
    k = (s < u[i] || s >= RADIX) ? 1 : 0;
    w[i + j0] = k ? s - RADIX : s;
  }

  for (; k && i < m; i++) {
    s = u[i + j1] + k;
    k = s === RADIX ? 1 : 0;
    w[i + j0] = k === 1 ? s - RADIX : s;
  }

  for (; i < m; i++) {
    w[i + j0] = u[i + j1];
  }

  return k;
};

/**
 * Starting at the end of the array, remove contiguous zeros.
 */
export const trimLeadingZeros = (data: number[]): void => {
  let i = data.length - 1;
  while (i >= 0 && data[i] === 0) {
    data.pop();
    i--;
  }
};

export class DivMod {

  // [quotient, remainder]
  private s: number[] = [0, 0];

  pow10(n: number, exp: number): number[] {
    return divpow10(this.s, n, exp);
  }

  /**
   * Divide and modulus n by w. Result is [quotient, remainder].
   */
  word(n: number, w: number): number[] {
    return divword(this.s, n, w);
  }

  size(n: number): number {
    const [q, r] = divword(this.s, n, RDIGITS);
    return r === 0 ? q : q + 1;
  }
}

/**
 * Divide and modulus n by 10^exp. Store result in d = [quotient, remainder].
 */
export const divpow10 = (d: number[], n: number, exp: number): number[] => {
  const p = POWERS10[exp];
  d[0] = (n / p) | 0;
  d[1] = n - d[0] * p;
  return d;
};

/**
 * Divide and modulus by w. Store result in d = [quotient, remainder].
 */
export const divword = (d: number[], n: number, div: number): number[] => {
  const q = (n / div) | 0;
  const r = n - q * div;
  return [q, r];
};
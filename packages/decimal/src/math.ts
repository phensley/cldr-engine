import { Constants, POWERS10 } from './types';

/**
 * Knuth TAoCP 4.3.1 Algorithm A
 * Addition of nonnegative n-place integers u and v, returning the sum w.
 * Numbers must already be aligned and length u >= length v.
 */
export const add = (u: number[], v: number[]): number[] => {
  const vlen = v.length;
  const n = u.length;
  const w: number[] = new Array(n);

  // A1. Initialize
  let j = 0;
  let k = 0;
  while (j < n) {
    // v may be shorter than u
    const vj = j < vlen ? v[j] : 0;

    // A2. Add digits
    const z = u[j] + vj + k;
    w[j] = z % Constants.RADIX;

    // .. k is being set to 1 or 0, to carry
    k = (z / Constants.RADIX) | 0;

    // A3. Loop on j
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
  const m = u.length;
  const n = v.length;
  const w: number[] = new Array(m);

  // S1. Initialize
  let j = 0;
  let k = 0;

  // S2. Subtract digits
  while (j < n) {
     const z = u[j] - v[j] - k;
     w[j] = z < 0 ? z + Constants.RADIX : z;
     // k is set to 1 or 0, indicating a borrow
     k = z < 0 ? 1 : 0;
    j++;

    // S3. Loop on j
  }

  // Propagate the borrow flag up
  while (k && j < m) {
    const z = u[j] - k;
    w[j] = z < 0 ? z + Constants.RADIX : z;
    k = z < 0 ? 1 : 0;
    j++;
  }

  // Borrow done, copy remainder of larger number
  while (j < m) {
    w[j] = u[j];
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

  // M1. Initialize, set w all to zero
  const w = new Array(n + m);
  w.fill(0);

  // Skip M2. Zero multiplier check, just follow the algorithm/

  let i = 0;
  let j = 0;
  let k = 0;
  while (j < n) {
    // M3. Initialize i
    i = 0;
    k = 0;
    while (i < m) {
      // M4. Multiply and add
      const p = (k + w[i + j]) + u[i] * v[j];
      k = (p / Constants.RADIX) | 0;
      w[i + j] = p - k * Constants.RADIX;

      // M5. Loop on i
      i++;
    }

    // Final carry
    w[j + m] = k;

    // M6. Loop on j
    j++;
  }
  return w;
};

/**
 * Multiplication of a nonnegative integer u by a single word v, returning the product w.
 * See TAoCP 4.3.1 exercise 13.
 */
export const multiplyword = (w: number[], u: number[], n: number, v: number): void => {
  let i = 0;
  let k = 0;
  for (i = 0; i < n; i++) {
    const p = (k + u[i] * v);
    k = (p / Constants.RADIX) | 0;
    w[i] = p - k * Constants.RADIX;
  }
  if (k > 0) {
    w[i] = k;
  }
};

/**
 * Knuth TAoCP 4.3.1 Algorithm D
 * Division of nonnegative integer u by v, returning the quotient q and remainder r.
 */
export const divide = (uc: number[], vc: number[], remainder: boolean): [number[], number[]] => {
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
  const d = (Constants.RADIX / (v[n - 1] + 1)) | 0;
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
    p = u[j + n - 1] + (u[j + n] * Constants.RADIX);
    let qhat = (p / v[n - 1]) | 0;
    let rhat = p - qhat * v[n - 1];
    while (true) {
      // D3. Test if q̂ = radix ...
      if (qhat < Constants.RADIX) {
        const z = qhat * v[n - 2];
        hi = (z / Constants.RADIX) | 0;
        lo = z - hi * Constants.RADIX;
        if (hi <= rhat) {
          if (hi !== rhat || lo <= u[j + n - 2]) {
            break;
          }
        }
      }

      // D3. ... decrease q̂ by 1, increase r̂ by v[n - 1]
      qhat--;
      rhat += v[n - 1];
      if (rhat >= Constants.RADIX) {
        break;
      }
    }

    // D4. Multiply and subtract.
    let i = 0;
    k = 0;
    for (i = 0; i <= n; i++) {
      // Multiply.
      p = qhat * v[i] + k;
      hi = (p / Constants.RADIX) | 0;
      lo = p - hi * Constants.RADIX;

      // Subtract and determine carry.
      const x = u[i + j] - lo;
      k = x < 0 ? 1 : 0;
      u[i + j] = k ? x + Constants.RADIX : x;
      k += hi;
    }

    // Set the j-th quotient digit
    q[j] = qhat;

    // D5. Test remainder of D4.
    if (k > 0) {
      // D6. Add back. Quotient digit is too large by 1.
      q[j] -= 1;
      addhelper(u, j, v, n + 1, n);
    }

    // D7. Loop on j.
    j--;
  }

  // D8. Unnormalize remainder.
  if (remainder) {
    k = 0;
    for (let i = n - 1; i >= 0; i--) {
      p = u[i] + (k * Constants.RADIX);
      r[i] = (p / d) | 0;
      k = p - r[i] * d;
    }
    return [q, r];
  }
  return [q, []];
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
  for (let i = n - 1; i >= 0; i--) {
    const p = u[i] + (r * Constants.RADIX);
    q[i] = (p / v) | 0;
    r = p - q[i] * v;
  }
  return [q, [r]];
};

/**
 * divide() "add back" helper, adds v to u.
 */
const addhelper = (u: number[], j: number, v: number[], m: number, n: number): void => {
  let i = 0;
  let k = 0;
  let s = 0;

  while (i < n) {
    s = u[i + j] + (v[i] + k);
    k = (s < u[i] || s >= Constants.RADIX) ? 1 : 0;
    u[i + j] = k ? s - Constants.RADIX : s;
    i++;
  }

  while (k && i < m) {
    s = u[i + j] + k;
    k = s === Constants.RADIX ? 1 : 0;
    u[i + j] = k === 1 ? s - Constants.RADIX : s;
    i++;
  }

  // Final carry is ignored
};

/**
 * Starting at the end of the array, remove all contiguous zeros except
 * the last.
 */
export const trimLeadingZeros = (data: number[]): void => {
  let i = data.length - 1;
  while (i > 0 && data[i] === 0) {
    data.pop();
    i--;
  }
};

/**
 * Reusable quotient and remainder for repeated divmod operations.
 */
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
export const divword = (_d: number[], n: number, div: number): number[] => {
  const q = (n / div) | 0;
  const r = n - q * div;
  return [q, r];
};

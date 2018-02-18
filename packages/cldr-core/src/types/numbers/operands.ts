import { digits } from './ops';
import { RDIGITS, POWERS10 } from './types';

// When a number crosses this limit we reduce it to avoid overflow.
// This limit is chosen so that a number <= this limit multipled
// by 10 will still be < MAX_SAFE_INTEGER.
const LIMIT = 10000000000000;

/**
 * Operands for use in evaluating localized plural rules:
 * See: http://www.unicode.org/reports/tr35/tr35-numbers.html#Plural_Operand_Meanings
 *
 * symbol    value
 * ----------------
 *   n       absolute value of the source number (integer and decimals)
 *   i       integer digits of n
 *   v       number of visible fraction digits in n, with trailing zeros
 *   w       number of visible fraction digits in n, without trailing zeros
 *   f       visible fractional digits in n, with trailing zeros
 *   t       visible fractional digits in n, without trailing zeros
 */
export interface NumberOperands {

  // Absolute value of N (integer portion only). Same as 'i'.
  n: number;

  // Integer digits of N.
  i: number;

  // Number of visible fraction digits of N, with trailing zeros.
  v: number;

  // Number of visible fraction digits of N, without trailing zeros.
  w: number;

  // Visible fraction digits in N, with trailing zeros.
  f: number;

  // Visible fraction digits of N, without trailing zeros.
  t: number;

  // Flag indicating N is negative.
  neg: boolean;

  // Flag indicating N has a decimal part.
  dec: boolean;
}

/**
 * Populate the number operands from the internals of a Decimal. Operands are created
 * in a single pass over the decimal's digits, to avoid creating expensive intermediate
 * string or array representations, e.g. Decimal.toString and re-parsing.
 */
export const decimalOperands = (sign: number, exp: number, data: number[]): NumberOperands => {
  const len = data.length;
  const last = len - 1;
  const neg = sign === -1;
  const dec = exp < 0;
  const precision = (last * RDIGITS) + digits(data[last]);

  // Local operands
  let n = 0;
  const v = exp < 0 ? -exp : 0;
  let w = 0;
  let f = 0;
  let t = 0;

  // Count trailing zeros
  let trail = 0;

  // Index of radix digit
  let x = last;

  // Index of decimal digit in radix digit
  let y = 0;

  let intdigits = precision + exp;

  // Leading decimal zeros aren't part of the operands.
  if (intdigits < 0) {
    intdigits = 0;
  }

outer:
  // Start at most-significant digit to least
  while (x >= 0) {
    let r = data[x];
    const c = x !== last ? RDIGITS : digits(r);
    y = c - 1;

    // Scan each decimal digit of the radix number from
    // most- to least- significant.
    while (y >= 0) {
      const p = POWERS10[y];
      const q = (r / POWERS10[y]) | 0;

      if (intdigits > 0) {
        // Integer part
        n = (n * 10) + q;
        if (n > LIMIT) {
          n = n % LIMIT;
        }
        intdigits--;

      } else {
        // Decimal part
        if (q === 0) {
          trail++;
        } else {
          trail = 0;
        }
        f = (f * 10) + q;
      }

      // If the decimal digits exceed our limit we bail out early.
      if (f > LIMIT) {
        break outer;
      }

      r %= p;
      y--;
    }
    x--;
  }

  // Trailing integer zeros
  while (exp > 0) {
    n *= 10;
    if (n > LIMIT) {
      n = n % LIMIT;
    }
    exp--;
  }

  // Special case for zero with exponent, e.g. '0.00'.
  if (len === 0 && exp < 0) {
    w = 0;
  } else {
    w = v - trail;
    t = f;
    while (trail > 0) {
      t /= 10;
      trail--;
    }
  }
  return { n, i: n, v, w, f, t, neg, dec };
};

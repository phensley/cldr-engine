import { Decimal } from '@phensley/decimal';

/**
 * Returns the number of digits in w, where w < RADIX.
 */
const digitCount = (w: number): number => {
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

const enum Constants {
  // 10^7 < sqrt(Number.MAX_SAFE_INTEGER)
  RADIX = 1e7,
  RDIGITS = 7,

  P0 = 1,
  P1 = 10,
  P2 = 100,
  P3 = 1000,
  P4 = 10000,
  P5 = 100000,
  P6 = 1000000,
  P7 = 10000000,
  P8 = 100000000
}

const POWERS10 = [
  Constants.P0,
  Constants.P1,
  Constants.P2,
  Constants.P3,
  Constants.P4,
  Constants.P5,
  Constants.P6,
  Constants.P7,
  Constants.P8
];

// When a number crosses this limit we reduce it to avoid overflow.
// This limit is chosen so that a number <= this limit multipled
// by 10 will still be < MAX_SAFE_INTEGER.
const LIMIT = 10000000000000;

const FIELDS: (keyof NumberOperands)[] = ['n', 'i', 'v', 'w', 'f', 't'];

export type Operand = 'n' | 'i' | 'v' | 'w' | 'f' | 't';

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
 *
 * @public
 */
export class NumberOperands {

  n: number = 0;
  i: number = 0;
  v: number = 0;
  w: number = 0;
  f: number = 0;
  t: number = 0;

  constructor(d: Decimal) {
    const props = d.properties();
    const flag = props[3];
    if (flag) {
      return;
    }

    const data = props[0];
    let exp = props[2];

    const len = data.length;
    const last = len - 1;
    // const neg = sign === -1;
    // const dec = exp < 0;
    const precision = (last * Constants.RDIGITS) + digitCount(data[last]);

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
      const c = x !== last ? Constants.RDIGITS : digitCount(r);
      y = c - 1;

      // Scan each decimal digit of the radix number from
      // most- to least- significant.
      while (y >= 0) {
        const p = POWERS10[y];
        const q = (r / POWERS10[y]) | 0;

        if (intdigits > 0) {
          // Integer part
          n = (n * 10) + q;

          // If the integer digits exceed the limit we apply modulus.
          if (n > LIMIT) {
            // Stay below the limit but preserve (a) the magnitude and (b) as
            // many of the least-significant digits as possible
            n = (n % LIMIT) + LIMIT;
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
        // Stay below the limit but preserve (a) the magnitude and (b) as
        // many of the least-significant digits as possible
        n = (n % LIMIT) + LIMIT;
      }
      exp--;
    }

    // Special case for zero with exponent, e.g. '0.00'.
    if (len === 1 && data[0] === 0 && exp < 0) {
      w = 0;
    } else {
      w = v - trail;
      t = f;
      while (trail > 0) {
        t /= 10;
        trail--;
      }
    }

    this.n = n;
    this.i = n;
    this.v = v;
    this.w = w;
    this.f = f;
    this.t = t;
  }

  toString(): string {
    return FIELDS.map(f => `${f}: ${this[f]}`).join(', ');
  }

}

// When a number crosses this limit we reduce it to avoid overflow.
// This limit is chosen so that a number <= this limit multipled
// by 10 will still be < MAX_SAFE_INTEGER.
const LIMIT = 10000000000000;

// TODO: Now that bignumber Decimal exists add a method to compute the
// number operands.

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
export class NumberOperands {

  // Absolute value of N (integer portion). Same as 'i'.
  n: number = 0;

  // Integer digits of N.
  i: number = 0;

  // Number of visible fraction digits of N, with trailing zeros.
  v: number = 0;

  // Number of visible fraction digits of N, without trailing zeros.
  w: number = 0;

  // Visible fraction digits in N, with trailing zeros.
  f: number = 0;

  // Visible fraction digits of N, without trailing zeros.
  t: number = 0;

  // Nmber of leading digits of the decimal portion of N.
  z: number = 0;

  // Flag indicating N is negative.
  negative: boolean = false;

  // Flag indicating N has a decimal part.
  decimal: boolean = false;

  constructor(num: string) {
    this.set(num);
  }

  /**
   * Set the operands using the string representation of the number.
   */
  set(num: string): void {
    let ni = 0;
    let nd = 0;
    let v = 0;
    let w = 0;
    let t = 0;
    let z = 0;
    let negative = false;
    let decimal = false;

    const len = num.length;
    let p = 0;
    if (num[0] === '-') {
      negative = true;
      p++;
    }

    // Track number of trailing zeros in floating mode.
    let trail = 0;

    // Indicates a non-zero leading digit on the decimal part.
    let leading = false;

    // Flag indicating an unexpected character was encounter.
    let fail = false;

    while (p < len) {
      const ch = num[p];
      switch (ch) {
      case '0':
        if (decimal) {
          v++;
          if (leading) {
            trail++;
          } else {
            z++;
          }
        }
        if (nd > 0) {
          nd *= 10;
        }
        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (decimal) {
          v++;
          leading = true;
        }
        trail = 0;
        if (nd > 0) {
          nd *= 10;
        }
        nd += Number(ch);
        break;

      case '.':
        if (decimal) {
          fail = true;
        } else {
          decimal = true;
          ni = nd;
          nd = 0;
        }
        break;

      default:
        fail = true;
        break;
      }

      if (fail) {
        break;
      }

      // Check for imminent overflow and reduce or bail out.
      if (decimal) {
        // Since we store the decimal digits as an integer we have
        // to bail out when crossing the limit.
        if (nd >= LIMIT) {
          break;
        }
      } else {
        // Reduce the decimal digits below the limit.
        nd = nd > LIMIT ? nd % LIMIT : nd;
      }

      p++;
    }

    // If no non-zero leading digit was detected, record the zeros as
    // trailing digits and reset the leading zero count.
    if (!leading) {
      trail = z;
      z = 0;
    }

    // Calculate the final values of operands tracking digit counts.
    if (decimal) {
      w = v - trail;
    } else {
      // Swap if we never saw a decimal point.
      ni = nd;
      nd = 0;
    }

    t = nd;
    for (let j = 0; j < trail; j++) {
      t /= 10;
    }

    this.n = ni;
    this.i = ni;
    this.v = v;
    this.w = w;
    this.f = nd;
    this.t = t;
    this.z = z;
    this.negative = negative;
    this.decimal = decimal;
  }
}

import { DivMod, add, subtract, multiply, trimLeadingZeros, divide } from './math';
import { allzero, compare, digits } from './operations';
import { NumberOperands, decimalOperands } from './operands';

import {
  Chars,
  Constants,
  DecimalFormat,
  ParseState,
  ParseFlags,
  POWERS10,
  RoundingMode,
  MathContext
} from './types';

const DEFAULT_FORMAT: DecimalFormat = {
  decimal: '.',
  group: '',
  minusSign: '-',
  minIntDigits: 1,
  minGroupingDigits: 1,
  primaryGroupSize: 3,
  secondaryGroupSize: 3
};

type GroupFunc = () => void;
const GROUP_NOOP: GroupFunc = (): void => {
  // nothing
};

/**
 * Arbitrary precision decimal type.
 */
export class Decimal {

  protected data: number[];
  protected sign: number;
  protected exp: number;

  constructor(num: number | string | Decimal) {
    if (typeof num === 'string' || typeof num === 'number') {
      this.parse(num);
    } else {
      this.data = num.data.slice();
      this.sign = num.sign;
      this.exp = num.exp;
    }
  }

  /**
   * Compare decimal u to v, returning the following:
   *
   *  -1   if  u < v
   *   0   if  u = v
   *   1   if  u > v
   *
   * If the abs flag is true compare the absolute values.
   */
  compare(v: Decimal, abs: boolean = false): number {
    const u = this;
    const us = u.sign;
    const vs = v.sign;
    if (!abs && us !== vs) {
      return us === -1 ? -1 : 1;
    }

    const ue = u.alignexp();
    const ve = v.alignexp();
    if (ue !== ve) {
      if (abs) {
        return ue < ve ? -1 : 1;
      }
      return ue < ve ? -1 * us : us;
    }

    if (u.exp !== v.exp) {
      const shift = u.exp - v.exp;
      if (shift > 0) {
        return -1 * compare(u.data, v.data, shift);
      }
      return compare(u.data, v.data, -shift);
    }

    // Same number of radix digits.
    let i = u.data.length;
    while (i >= 0) {
      const a = u.data[i];
      const b = v.data[i];
      if (a !== b) {
        return (a < b ? -1 : 1) * (abs ? 1 : u.sign);
      }
      i--;
    }

    // Equal
    return 0;
  }

  /**
   * Compute operands for this number, used for determining the plural category.
   */
  operands(): NumberOperands {
    return decimalOperands(this.sign, this.exp, this.data);
  }

  /**
   * Invert this number's sign.
   */
  negate(): Decimal {
    return this.sign === 0 ? new Decimal(this) : Decimal.fromRaw(-this.sign, this.exp, this.data);
  }

  /**
   * Indicates this number is negative.
   */
  isNegative(): boolean {
    return this.sign === -1;
  }

  /**
   * Check if this number can be represented as an integer without loss of precision.
   * For example, '12.000' is the same number as '12'.
   */
  isInteger(): boolean {
    return this.sign === 0 ? true : this.exp + this.trailingZeros() >= 0;
  }

  add(v: Decimal): Decimal {
    return this.addsub(this, v, v.sign);
  }

  subtract(v: Decimal): Decimal {
    return this.addsub(this, v, v.sign === 1 ? -1 : 1);
  }

  multiply(v: Decimal): Decimal {
    const u = this;
    const w = new Decimal(ZERO);
    w.exp = u.exp + v.exp;

    if (u.sign === 0 || v.sign === 0) {
      return w;
    }

    w.data = multiply(u.data, v.data);
    w.sign = u.sign === v.sign ? 1 : -1;
    return w.trim();
  }

  /**
   * Divide this number by v and return the quotient.
   */
  divide(v: Decimal, context?: MathContext): Decimal {
    let w = this.checkDivision(v);
    if (w !== undefined) {
      return w;
    }

    let u: Decimal = this;
    w = new Decimal(ZERO);

    const prec = context === undefined ? Math.max(v.precision(), u.precision()) + 1 : context.precision;
    const mode = context === undefined ? RoundingMode.HALF_EVEN : context.roundingMode;

    const shift = (v.precision() - u.precision()) + prec + 1;
    const exp = (u.exp - v.exp) - shift;
    if (shift > 0) {
      u = u.shiftleft(shift);
    } else {
      v = v.shiftleft(-shift);
    }

    // Perform the division.
    const [q] = divide(u.data, v.data, false);
    w.data = q;
    w.sign = u.sign === v.sign ? 1 : -1;
    w.exp = exp;
    w.trim();

    // Adjust precision of result
    const d = w.precision() - prec;
    w = d > 0 ? w.shiftright(d, mode) : w.shiftright(1, mode);
    return context === undefined ? w.stripTrailingZeros() : w;
  }

  /**
   * Divide this number by v and return the quotient and remainder.
   */
  divmod(v: Decimal): [Decimal, Decimal] {
    const w = this.checkDivision(v);
    if (w !== undefined) {
      return [w, new Decimal(v)];
    }

    let u: Decimal = this;
    const exp = u.exp > v.exp ? v.exp : u.exp;
    if (u.exp !== v.exp) {
      const shift = u.exp - v.exp;
      if (shift > 0) {
        u = u.shiftleft(shift);
      } else {
        v = v.shiftleft(-shift);
      }
    }

    const [qd, rd] = divide(u.data, v.data, true);

    const q = new Decimal(ZERO);
    q.data = qd;
    q.sign = u.sign === v.sign ? 1 : -1;

    const r = new Decimal(ZERO);
    r.data = rd;
    r.sign = u.sign;
    r.exp = exp;

    return [q.trim(), r.trim()];
  }

  /**
   * Number of trailing zeros.
   */
  trailingZeros(): number {
    const d = this.data;
    const len = d.length;
    let r = 0;
    for (let i = 0; i < len; i++) {
      if (d[i] !== 0) {
        let n = d[i];
        r = i * Constants.RDIGITS;
        while (n % 10 === 0) {
          n /= 10 | 0;
          r++;
        }
        break;
      }
    }
    return r;
  }

  /**
   * Strip all trailing zeros.
   */
  stripTrailingZeros(): Decimal {
    const n = this.trailingZeros();
    return n > 0 ? this.shiftright(n, RoundingMode.TRUNCATE) : new Decimal(this);
  }

  /**
   * Number of digits in the unscaled value.
   */
  precision(): number {
    if (this.sign === 0) {
      return 1;
    }
    const len = this.data.length;
    return ((len - 1) * Constants.RDIGITS) + digits(this.data[len - 1]);
  }

  /**
   * Scale is the number of digits to the right of the decimal point.
   */
  scale(): number {
    return this.exp === 0 ? 0 : -this.exp;
  }

  /**
   * Returns a new number with the given scale, shifting the coefficient as needed.
   */
  setScale(scale: number, roundingMode: RoundingMode = RoundingMode.HALF_EVEN): Decimal {
    const diff = scale - this.scale();
    const r = diff > 0 ? this.shiftleft(diff) : this.shiftright(-diff, roundingMode);
    r.exp = scale === 0 ? 0 : -scale;
    return r;
  }

  /**
   * Adjusted exponent for alignment. Two numbers with the same aligned exponent are
   * aligned for arithmetic operations. If the aligned exponents do not match one
   * number must be shifted.
   */
  alignexp(): number {
    return (this.exp + this.precision()) - 1;
  }

  /**
   * Return the storage space needed to hold a given number of digits.
   */
  size(n: number): number {
    const q = (n / Constants.RDIGITS) | 0;
    const r = n - q * Constants.RDIGITS;
    return r === 0 ? q : q + 1;
  }

  /**
   * Move the decimal point -n (left) or +n (right) places. Does not change
   * precision, only affects the exponent.
   */
  movePoint(n: number): Decimal {
    const w = new Decimal(this);
    w.exp += n;
    return w;
  }

  /**
   * Shifts all digits to the left, increasing the precision.
   */
  shiftleft(shift: number): Decimal {
    const w = new Decimal(this);
    if (shift <= 0 || w.sign === 0) {
      return w;
    }
    const u = this;
    let m = u.data.length;

    // Compute the shift in terms of our radix.
    const q = (shift / Constants.RDIGITS) | 0;
    const r = shift - q * Constants.RDIGITS;

    // Expand w to hold shifted result and zero all elements.
    let n = this.size(u.precision() + shift);
    w.data = new Array(n);
    w.data.fill(0);

    // Trivial case where shift is a multiple of our radix.
    if (r === 0) {
      while (--m >= 0) {
        w.data[m + q] = u.data[m];
      }
      return w;
    }

    // Shift divided by radix leaves a remainder.
    const powlo = POWERS10[r];
    const powhi = POWERS10[Constants.RDIGITS - r];
    let hi = 0;
    let lo = 0;
    let loprev = 0;

    n--;
    m--;
    hi = (u.data[m] / powhi) | 0;
    loprev = u.data[m] - hi * powhi;
    if (hi !== 0) {
      w.data[n] = hi;
      n--;
      m--;
    }

    // Divmod each element of u, copying the hi/lo parts to w.
    for (; m >= 0; m--, n--) {
      hi = (u.data[m] / powhi) | 0;
      lo = u.data[m] - hi * powhi;
      w.data[n] = powlo * loprev + hi;
      loprev = lo;
    }
    w.data[q] = powlo * loprev;
    return w;
  }

  /**
   * Shifts all digits to the right, reducing the precision. Result is rounded
   * using the given rounding mode.
   */
  shiftright(shift: number, mode: RoundingMode = RoundingMode.HALF_EVEN): Decimal {
    const w = new Decimal(this);
    if (shift <= 0 || w.sign === 0) {
      return w;
    }
    w.data.fill(0);
    const u = this;

    const div = new DivMod();
    const [q, r] = div.word(shift, Constants.RDIGITS);

    let i = 0, j = 0;
    let rnd = 0, rest = 0;

    if (r === 0) {
      if (q > 0) {
        [rnd, rest] = div.pow10(u.data[q - 1], Constants.RDIGITS - 1);
        if (rest === 0) {
          rest = allzero(u.data, q - 1) === 0 ? 1 : 0;
        }
      }
      for (j = 0; j < u.data.length - q; j++) {
        w.data[j] = u.data[q + j];
      }
      return w.trim();
    }

    let hiprev = 0;
    const ph = POWERS10[Constants.RDIGITS - r];
    [hiprev, rest] = div.pow10(u.data[q], r);
    [rnd, rest] = div.pow10(rest, r - 1);
    if (rest === 0 && q > 0) {
      rest = allzero(u.data, q) === 0 ? 1 : 0;
    }

    for (j = 0, i = q + 1; i < u.data.length; i++, j++) {
      const [hi, lo] = div.pow10(u.data[i], r);
      w.data[j] = ph * lo + hiprev;
      hiprev = hi;
    }
    if (hiprev !== 0) {
      w.data[j] = hiprev;
    }

    w.exp += shift;
    if (w.round(rnd, mode)) {
      w._increment();
    }
    return w.trim();
  }

  /**
   * Format the number to a string, using fixed point.
   */
  toString(): string {
    return this.format(DEFAULT_FORMAT);
  }

  // TODO: support scientific formats

  /**
   * Render this number to a string, using the given formatting options.
   *
   * TODO: support alternate digit systems, algorithmic / spellout
   */
  format(format: DecimalFormat): string {
    // Determine if grouping is enabled, and set the primary and
    // secondary group sizes.
    const grouping = format.group !== '';
    const pgs = format.primaryGroupSize;
    let sgs = format.secondaryGroupSize;
    if (sgs < 0) {
      sgs = pgs;
    }

    let exp = this.exp;

    // Determine how many integer digits to emit. If integer digits is
    // larger than the integer coefficient we emit leading zeros.
    let int = this.precision() + exp;
    if (format.minIntDigits === 0 && this.compare(ONE, true) === -1) {
      // If the number is between 0 and 1 and format requested minimum
      // integer digits of zero, don't emit a leading zero digit.
      int = 0;
    } else {
      int = Math.max(int, format.minIntDigits);
    }

    // Array to append digits in reverse order
    const r: string[] = [];
    const len = this.data.length;
    let groupSize = pgs;
    let emitted = 0;

    // Determine if grouping should be active.
    let groupFunc = GROUP_NOOP;
    if (grouping && pgs > 0 && int >= format.minGroupingDigits + pgs) {
      groupFunc = () => {
        if (emitted > 0 && emitted % groupSize === 0) {
          // Push group character, reset emitted digits, and switch
          // to secondary grouping size.
          r.push(format.group);
          emitted = 0;
          groupSize = sgs;
        }
      };
    }

    // Push trailing zeros for a positive exponent
    let zeros = exp;
    while (zeros > 0) {
      r.push('0');
      emitted++;
      int--;
      if (int > 0) {
        groupFunc();
      }
      zeros--;
    }

    // Scan coefficient from least- to most-significant digit.
    const last = len - 1;
    for (let i = 0; i < len; i++) {
      // Count the decimal digits c in this radix digit d
      let d = this.data[i];
      const c = i === last ? digits(d) : Constants.RDIGITS;

      // Loop over the decimal digits
      for (let j = 0; j < c; j++) {
        // Push decimal digit
        r.push(String(d % 10));
        d = (d / 10) | 0;

        // When we've reached exponent of 0, push the decimal point.
        exp++;
        if (exp === 0) {
          r.push(format.decimal);
        }

        // Decrement integer, increment emitted digits when exponent is positive, to
        // trigger grouping logic. We only do this once exp has become positive to
        // avoid counting emitted digits for decimal part.
        if (exp > 0) {
          emitted++;
          int--;
          if (int > 0) {
            groupFunc();
          }
        }
      }
    }

    // If exponent still negative, emit leading decimal zeros
    while (exp < 0) {
      r.push('0');

      // When we've reached exponent of 0, push the decimal point
      exp++;
      if (exp === 0) {
        r.push(format.decimal);
      }
    }

    // Leading integer zeros
    while (int > 0) {
      r.push('0');
      emitted++;
      int--;
      if (int > 0) {
        groupFunc();
      }
    }

    // Sign symbol
    if (this.sign === -1) {
      r.push(format.minusSign);
    }

    return r.reverse().join('');
  }

  protected static fromRaw(sign: number, exp: number, data: number[]): Decimal {
    return new Decimal({ sign, exp, data} as any as Decimal);
  }

  /**
   * Check for u/0 or 0/v cases.
   */
  protected checkDivision(v: Decimal): Decimal | undefined {
    if (v.sign === 0) {
      throw new Error('Divide by zero');
    }
    const vlen = v.data.length;
    if (this.sign === 0 || this.data.length < vlen) {
      return new Decimal(ZERO);
    }
    return undefined;
  }

  /**
   * Trim leading zeros from a result and reset sign and exponent accordingly.
   */
  protected trim(): Decimal {
    trimLeadingZeros(this.data);
    if (this.data.length === 0) {
      this.sign = 0;
    }
    return this;
  }

  /**
   * Increment the least-significant digit by 1.
   */
  protected _increment(): void {
    const d = this.data;
    const len = d.length;
    let s = 0;
    let k = 1;
    for (let i = 0; k === 1 && i < len; i++) {
      s = d[i] + k;
      k = s === Constants.RADIX ? 1 : 0;
      d[i] = k ? 0 : s;
    }
    if (k === 1) {
      d.push(1);
    }
    // Check if we incremented from zero.
    if (this.sign === 0) {
      this.sign = 1;
    }
  }

  /**
   * Return a rounding indicator for a given rounding mode,
   */
  protected round(rnd: number, mode: RoundingMode): number {
    switch (mode) {
    case RoundingMode.UP:
      return Number(rnd !== 0);
    case RoundingMode.DOWN:
    case RoundingMode.TRUNCATE:
      return 0;
    case RoundingMode.CEILING:
      return Number(!(rnd === 0 || this.sign === -1));
    case RoundingMode.FLOOR:
      return Number(!(rnd === 0 || this.sign >= 0));
    case RoundingMode.HALF_UP:
      return Number(rnd >= 5);
    case RoundingMode.HALF_DOWN:
      return Number(rnd > 5);
    case RoundingMode.HALF_EVEN:
      return Number((rnd > 5) || ((rnd === 5 && this.isodd())));
    case RoundingMode.ZERO_FIVE_UP:
    {
      const lsd = this.data.length > 0 ? this.data[0] % 10 : 0;
      return Number(!(rnd === 0) && (lsd === 0 || lsd === 5));
    }
    default:
      return 0;
    }
  }

  /**
   * Return true if this instance is odd.
   */
  protected isodd(): boolean {
    return this.data.length > 0 && (this.data[0] % 2 === 1);
  }

  /**
   * Addition and subtraction.
   */
  protected addsub(u: Decimal, v: Decimal, vsign: number): Decimal {
    const zero = u.sign === 0;
    if (zero || v.sign === 0) {
      return zero ? Decimal.fromRaw(vsign, v.exp, v.data) : new Decimal(u);
    }

    let m = u; // m = bigger
    let n = v; // n = smaller
    let swap = 0;
    if (m.exp < n.exp) {
      [m, n] = [n, m];
      swap++;
    }

    const shift = m.exp - n.exp;
    m = m.shiftleft(shift);

    const w = new Decimal(ZERO);
    w.exp = n.exp;

    if (m.data.length < n.data.length) {
      [m, n] = [n, m];
      swap++;
    }

    if (u.sign === vsign) {
      w.data = add(m.data, n.data);
      w.sign = vsign;

    } else {
      const ulen = m.data.length;
      const vlen = n.data.length;
      if (ulen === vlen) {
        for (let i = ulen - 1; i >= 0; i--) {
          if (m.data[i] !== n.data[i]) {
            if (m.data[i] < n.data[i]) {
              [m, n] = [n, m];
              swap++;
            }
            break;
          }
        }
      }
      w.data = subtract(m.data, n.data);
      w.sign = (swap & 1) === 1 ? vsign : m.sign;
    }
    return w.trim();
  }

  /**
   * Parse a number or string setting the fields on the current instance.
   */
  protected parse(arg: string | number): void {
    const str: string = typeof arg === 'string' ? arg : arg.toString();
    const msg = this._parse(str);
    if (msg !== undefined) {
      throw new Error(msg);
    }
  }

  /**
   * Parse a string into a Decimal.
   *
   * Expects strings of the form:  "[-+][digits][.][digits][eE][-+][digits]"
   */
  protected _parse(str: string): string | undefined {
    const len = str.length;

    // Local variables to accumulate digits, sign and exponent
    const data: number[] = [];
    let sign = 0;
    let exp = 0;

    // Flags to control parsing, raise errors.
    let flags = 0;

    // Current number being parsed.
    let n = 0;

    // Index of power for current digit.
    let z = 0;

    // Pointer to the current character being parsed.
    let i = len - 1;

    // Total number of digits parsed.
    let dig = 0;

    // We parse from the end to avoid multiple passes or splitting of the
    // input string.
     while (i >= 0) {
      const code = str.charCodeAt(i);
      switch (code) {
      case Chars.ELOWER:
      case Chars.EUPPER:
        if (flags & ParseFlags.EXP) {
          return `Extra exponent character at ${i}`;
        }
        if (data.length > 0) {
          // Exponent is currently limited to the size of Constants.RADIX
          return 'Exponent too large';
        }
        if (dig === 0) {
          return 'Exponent not provided';
        }
        // Indicate we have an exponent, and clear the sign flag.
        flags |= ParseFlags.EXP;
        flags &= ~ParseFlags.SIGN;

        // Copy the parsed number to the exponent and reset the digit count.
        dig = 0;
        exp = sign === -1 ? -n : n;
        sign = 0;
        n = 0;
        z = 0;
        break;

      case Chars.MINUS:
      case Chars.PLUS:
        if (dig === 0) {
          return 'Found a bare sign symbol';
        }
        if (flags & ParseFlags.SIGN) {
          return `Duplicate sign character at ${i}`;
        }
        sign = code === Chars.MINUS ? -1 : 0;
        flags |= ParseFlags.SIGN;
        break;

      case Chars.DOT:
        if (flags & ParseFlags.POINT) {
          return `Extra radix point seen at ${i}`;
        }
        flags |= ParseFlags.POINT;
        exp -= dig;
        break;

      case Chars.DIGIT0:
      case Chars.DIGIT1:
      case Chars.DIGIT2:
      case Chars.DIGIT3:
      case Chars.DIGIT4:
      case Chars.DIGIT5:
      case Chars.DIGIT6:
      case Chars.DIGIT7:
      case Chars.DIGIT8:
      case Chars.DIGIT9:
        n += (code - Chars.DIGIT0) * POWERS10[z];
        z++;
        dig++;
        if (z === Constants.RDIGITS) {
          data.push(n);
          n = 0;
          z = 0;
        }
        break;

      default:
        return `Unexpected character at ${i}: ${str[i]}`;
      }
      i--;
    }

    if (dig === 0) {
      return 'Number must include at least 1 digit';
    }

    if (n > 0) {
      data.push(n);
    }

    this.data = data;
    this.sign = sign === -1 ? -1 : 1;
    this.exp = exp;
    this.trim();
    return undefined;
  }

}

export const ZERO = new Decimal('0');
export const ONE = new Decimal('1');

// https://oeis.org/A000796/constant
export const PI = new Decimal(
  '3.141592653589793238462643383279502884197169399375105' +
  '82097494459230781640628620899862803482534211706798214');

// https://oeis.org/A001113/constant
export const E = new Decimal(
  '2.718281828459045235360287471352662497757247093699959' +
  '57496696762772407663035354759457138217852516642742746'
);

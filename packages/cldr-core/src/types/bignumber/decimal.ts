import { DivMod, add, subtract, multiply, trimLeadingZeros, divide } from './math';
import { allzero, compare, digits } from './ops';
import {
  Chars,
  DecimalFormat,
  ParseState,
  ParseFlags,
  POWERS10,
  Power10,
  RADIX,
  RDIGITS,
  RoundingMode
} from './types';

const DEFAULT_FORMAT: DecimalFormat = {
  decimal: '.',
  group: ',',
  minIntDigits: 1,
  minGroupingDigits: 1,
  primaryGroupSize: 3,
  secondaryGroupSize: 3
};

/**
 * Arbitrary precision decimal type.
 */
export class Decimal {

  protected data: number[];
  protected sign: number;
  protected exp: number;

  constructor(num: number | string | Decimal) {
    if (num instanceof Decimal) {
      this.data = num.data.slice();
      this.sign = num.sign;
      this.exp = num.exp;
    } else {
      this.parse(num);
    }
  }

  compare(v: Decimal): number {
    const u = this;
    const us = u.sign;
    const vs = v.sign;
    if (us !== vs) {
      return us === -1 ? -1 : 1;
    }

    const ue = u.alignexp();
    const ve = v.alignexp();
    if (ue !== ve) {
      return ue < ve ? -1 * us : us;
    }

    if (u.exp !== v.exp) {
      const shift = u.exp - v.exp;
      if (shift > 0) {
        return -1 * compare(u.data, v.data, shift);
      }
      return compare(u.data, v.data, -shift);
    }

    // Same number of digits.
    let i = u.data.length;
    while (i >= 0) {
      const a = u.data[i];
      const b = v.data[i];
      if (a !== b) {
        return (a < b ? -1 : 1) * u.sign;
      }
      i--;
    }

    // Equal
    return 0;
  }

  isNegative(): boolean {
    return this.sign === -1;
  }

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
    if (u.sign === 0 || v.sign === 0) {
      return w;
    }

    w.data = multiply(u.data, v.data);
    w.sign = u.sign === v.sign ? 1 : -1;
    w.exp = u.exp + v.exp;
    w.trim();
    return w;
  }

  /**
   * Divide this number by v and return the quotient.
   */
  divide(v: Decimal): Decimal {
    let w = this.checkDivision(v);
    if (w !== undefined) {
      return w;
    }

    const u = this;
    w = new Decimal(ZERO);

    // TODO: precision support.
    const prec = 20;
    const shift = (u.precision() - v.precision()) + prec + 1;
    const iexp = u.exp - v.exp;
    const exp = iexp - shift;

    // console.log(`u=${u.data} v=${v.data}  shift=${shift} iexp=${iexp}  exp=${exp}`);

    // TODO: shift u or v depending on direction of shift

    const [q, r] = divide(u.data, v.data, false);
    w.data = q;
    w.sign = u.sign === v.sign ? 1 : -1;

    w.trim();
    return w;
  }

  /**
   * Divide this number by v and return the quotient and remainder.
   */
  divmod(v: Decimal): [Decimal, Decimal] {
    const w = this.checkDivision(v);
    if (w !== undefined) {
      return [w, new Decimal(ZERO)];
    }

    const [qd, rd] = divide(this.data, v.data, true);
    const q = new Decimal(ZERO);
    q.data = qd;
    const r = new Decimal(ZERO);
    r.data = rd;

    q.trim();
    r.trim();
    return [q, r];
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
        r = i * RDIGITS;
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
    return ((len - 1) * RDIGITS) + digits(this.data[len - 1]);
  }

  /**
   * Scale is the number of digits to the right of the decimal point.
   */
  scale(): number {
    return this.exp === 0 ? 0 : -this.exp;
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
    const q = (n / RDIGITS) | 0;
    const r = n - q * RDIGITS;
    return r === 0 ? q : q + 1;
  }

  /**
   * Move the decimal point +n (left) or -n (right) places.
   */
  movePoint(n: number): Decimal {
    const w = new Decimal(this);
    if (n === 0) {
      return w;
    }
    const shift = w.exp + n;
    console.log(`shift=${shift}`);
    return w;
  }

  shiftleft(shift: number): Decimal {
    const w = new Decimal(this);
    if (shift <= 0 || w.sign === 0) {
      return w;
    }
    const u = this;
    let m = u.data.length;

    // Compute the shift in terms of our radix.
    const q = (shift / RDIGITS) | 0;
    const r = shift - q * RDIGITS;

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
    const powhi = POWERS10[RDIGITS - r];
    let hi = 0, lo = 0, loprev = 0;

    n--;
    m--;
    hi = (u.data[m] / powhi) | 0;
    loprev = u.data[m] - hi * powhi;
    if (hi !== 0) {
      w.data[n--] = hi;
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
   * Shifts all digits to the right, reducing the precision by shift.
   */
  shiftright(shift: number, mode: RoundingMode = RoundingMode.HALF_EVEN): Decimal {
    const w = new Decimal(this);
    if (shift <= 0 || w.sign === 0) {
      return w;
    }
    w.data.fill(0);
    const u = this;

    const div = new DivMod();
    const [q, r] = div.word(shift, RDIGITS);

    let i = 0, j = 0;
    let rnd = 0, rest = 0;

    if (r === 0) {
      if (q > 0) {
        [rnd, rest] = div.pow10(u.data[q - 1], RDIGITS - 1);
        if (rest === 0) {
          rest = allzero(u.data, q - 1) === 0 ? 1 : 0;
        }
      }
      for (j = 0; j < u.data.length - q; j++) {
        w.data[j] = u.data[q + j];
      }
      w.trim();
      return w;
    }

    let hiprev = 0;
    const ph = POWERS10[RDIGITS - r];
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
    w.trim();
    return w;
  }

  toString(): string {
    return this.format(DEFAULT_FORMAT);
  }

  /**
   * Render this number to a string, using the given formatting options.
   *
   * TODO: support alternate digit systems, algorithmic / spellout
   */
  format(format: DecimalFormat): string {
    const grouping = format.group !== '';
    const pgs = format.primaryGroupSize;
    let sgs = format.secondaryGroupSize;
    if (sgs < 0) {
      sgs = pgs;
    }

    let exp = this.exp;
    if (exp > 0) {
      exp--;
    }

    let int = this.precision() + exp;
    if (format.minIntDigits === 0 && this.compare(ONE) === -1) {
      int = 0;
    } else {
      int = Math.max(int, format.minIntDigits);
    }

    let shouldGroup = false;
    if (grouping && pgs > 0) {
      shouldGroup = int >= format.minGroupingDigits + pgs;
    }

    const r: string[] = [];
    const len = this.data.length;
    let groupSize = pgs;
    let emitted = 0;

    let zeros = exp;
    while (zeros > 0) {
      if (shouldGroup) {
        const emit = emitted > 0 && emitted % groupSize === 0;
        if (emit) {
          r.push(format.group);
          emitted -= groupSize;
          groupSize = sgs;
        }
      }
      r.push('0');
      zeros--;
      int--;
      emitted++;
    }

    for (let i = 0; i < len; i++) {
      let d = this.data[i];
      const c = digits(d);
      for (let j = 0; j < c; j++) {
        if (exp === 0) {
          r.push(format.decimal);
        }
        exp++;

        r.push(String(d % 10));
        d = (d / 10) | 0;

        if (shouldGroup) {
          const emit = emitted > 0 && emitted % groupSize === 0;
          if (emit) {
            r.push(format.group);
            emitted -= groupSize;
            groupSize = sgs;
          }
        }
        if (exp >= 0) {
          int--;
          emitted++;
        }
      }
    }

    while (exp < 0) {
      r.push('0');
      exp++;
      if (exp === 0) {
        r.push(format.decimal);
      }
    }

    // Leading zeros
    while (int > 0) {
      r.push('0');
      int--;
    }

    r.reverse();
    return r.join('');
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
  protected trim(): void {
    trimLeadingZeros(this.data);
    if (this.data.length === 0) {
      this.sign = 0;
      this.exp = 0;
    }
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
      k = s === RADIX ? 1 : 0;
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
      return zero ? new Decimal(v) : new Decimal(u);
    }

    let swap = 0;
    if (u.exp < v.exp) {
      [u, v] = [v, u];
      swap++;
    }

    const shift = u.exp - v.exp;
    u = u.shiftleft(shift);

    const w = new Decimal(ZERO);
    w.exp = v.exp;

    if (u.data.length < v.data.length) {
      [u, v] = [v, u];
      swap++;
    }

    if (u.sign === vsign) {
      w.data = add(u.data, v.data);
      w.sign = vsign;

    } else {
      const ulen = u.data.length;
      const vlen = v.data.length;
      if (ulen === vlen) {
        for (let i = ulen - 1; i >= 0; i--) {
          if (u.data[i] !== v.data[i]) {
            if (u.data[i] < v.data[i]) {
              [u, v] = [v, u];
              swap++;
            }
            break;
          }
        }
      }
      w.data = subtract(u.data, v.data);
      w.sign = (swap & 1) === 1 ? vsign : u.sign;
    }
    w.trim();
    return w;
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
        if (z === RDIGITS) {
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

const ZERO = new Decimal('0');
const ONE = new Decimal('1');

import { add, divide, multiply, subtract, trimLeadingZeros, DivMod } from './math';
import { allzero, compare, digitCount } from './operations';
import { decimalOperands, NumberOperands } from './operands';
import { DecimalFormatter, Part, PartsDecimalFormatter, StringDecimalFormatter } from './format';
import {
  Chars,
  Constants,
  DecimalFlag,
  MathContext,
  ParseFlags,
  POWERS10,
  RoundingModeType
} from './types';

const { floor } = Math;

type GroupFunc = () => void;
const GROUP_NOOP: GroupFunc = (): void => {
  // nothing
};

const enum Op {
  ADDITION = 0,
  SUBTRACTION = 1,
  MULTIPLICATION = 2,
  DIVISION = 3,
  MOD = 4
}

const DEFAULT_PRECISION = 28;
const EMPTY: number[] = [];

const NAN_VALUES = new Set(['nan', 'NaN']);
const POS_INFINITY = new Set(['infinity', '+infinity', 'Infinity', '+Infinity']);
const NEG_INFINITY = new Set(['-infinity', '-Infinity']);

export const DECIMAL_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export type DecimalArg = number | string | Decimal;

export const coerceDecimal = (n: DecimalArg): Decimal =>
  typeof n === 'number' || typeof n === 'string' ? new Decimal(n) : n;

/**
 * Parses and interprets a math context argument, with appropriate defaults.
 */
const parseMathContext = (rounding: RoundingModeType, context?: MathContext): [boolean, number, RoundingModeType] => {
  let usePrecision = true;
  let scaleprec = DEFAULT_PRECISION;
  if (context !== undefined) {
    if (context.scale !== undefined) {
      scaleprec = context.scale;
      usePrecision = false;
    } else if (context.precision !== undefined) {
      scaleprec = Math.max(context.precision, 0);
    }
    if (context.round !== undefined) {
      rounding = context.round;
    }
  }
  return [usePrecision, scaleprec, rounding];
};

/**
 * Return the storage space needed to hold a given number of digits.
 */
const size = (n: number): number => {
  const q = (n / Constants.RDIGITS) | 0;
  const r = n - q * Constants.RDIGITS;
  return r === 0 ? q : q + 1;
};

/**
 * Arbitrary precision decimal type.
 *
 * @alpha
 */
export class Decimal {

  protected data: number[] = EMPTY;
  protected sign: number = 0;
  protected exp: number = 0;
  protected flag: DecimalFlag = DecimalFlag.NONE;

  constructor(num: DecimalArg) {
    if (typeof num === 'string' || typeof num === 'number') {
      this.parse(num);
    } else {
      this.data = num.data.slice();
      this.sign = num.sign;
      this.exp = num.exp;
      this.flag = num.flag;
    }
  }

  isNaN(): boolean {
    return this.flag === DecimalFlag.NAN;
  }

  isFinite(): boolean {
    return this.flag === 0;
  }

  isInfinity(): boolean {
    return this.flag === DecimalFlag.INFINITY;
  }

  /**
   * Compare decimal u to v, returning the following:
   *
   *  -1   if  u &lt; v
   *   0   if  u = v
   *   1   if  u &gt; v
   *
   * If the abs flag is true compare the absolute values.
   *
   * Any NAN argument will always return -1.
   */
  compare(v: DecimalArg, abs: boolean = false): number {
    const u: Decimal = this;
    v = coerceDecimal(v);

    if (u.flag || v.flag) {
      // NAN is never equal to itself or any other value
      if (u.flag === DecimalFlag.NAN || v.flag === DecimalFlag.NAN) {
        return -1;
      }

      // INFINITY

      // Infinities can be equal if their sign matches
      if (u.flag === v.flag) {
        return u.sign === v.sign ? 0 : u.sign === -1 ? -1 : 1;
      }

      // Negative infinity before all other values
      // Positive infinity after all other values
      return u.flag === DecimalFlag.INFINITY ?
        u.sign === -1 ? -1 : 1 :
        v.sign === -1 ? -1 : 1;
    }

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
        const c = compare(v.data, u.data, shift);
        return c === 0 ? c : -c;
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
   *
   * A NAN or INFINITY will return the same operands as ZERO.
   */
  operands(): NumberOperands {
    return decimalOperands(this.sign, this.exp, this.data);
  }

  /**
   * Return the absolute value of the number.
   */
  abs(): Decimal {
    return this.sign === -1 ? Decimal.fromRaw(-this.sign, this.exp, this.data, this.flag) : this;
  }

  /**
   * Invert this number's sign.
   */
  negate(): Decimal {
    return this.sign === 0 ? this : Decimal.fromRaw(-this.sign, this.exp, this.data, this.flag);
  }

  /**
   * Indicates this number is negative.
   */
  isNegative(): boolean {
    return this.sign === -1;
  }

  /**
   * Signum.
   */
  signum(): number {
    return this.sign;
  }

  /**
   * Check if this number can be represented as an integer without loss of precision.
   * For example, '12.000' is the same number as '12'.
   */
  isInteger(): boolean {
    if (this.flag) {
      return false;
    }
    return this.sign === 0 ? true : this.exp + this.trailingZeros() >= 0;
  }

  /**
   * Return the integer part.
   */
  toInteger(): Decimal {
    return this.flag ? this : this.setScale(0, 'down');
  }

  /**
   * Adds v.
   */
  add(v: DecimalArg): Decimal {
    v = coerceDecimal(v);
    const r = this.handleFlags(Op.ADDITION, v);
    return r === undefined ? this.addsub(this, v, v.sign) : r;
  }

  /**
   * Subtracts v.
   */
  subtract(v: DecimalArg): Decimal {
    v = coerceDecimal(v);
    const r = this.handleFlags(Op.SUBTRACTION, v);
    return r === undefined ? this.addsub(this, v, v.sign === 1 ? -1 : 1) : r;
  }

  /**
   * Multiplies by v with optional math context.
   */
  multiply(v: DecimalArg, context?: MathContext): Decimal {
    const [usePrecision, scaleprec, rounding] = parseMathContext('half-even', context);
    v = coerceDecimal(v);
    const r = this.handleFlags(Op.MULTIPLICATION, v);
    if (r !== undefined) {
      return r;
    }

    const u: Decimal = this;

    const w = new Decimal(ZERO);
    w.exp = (u.exp + v.exp);

    if (u.sign === 0 || v.sign === 0) {
      if (!usePrecision) {
        w._setScale(scaleprec);
      }
      return w;
    }

    w.data = multiply(u.data, v.data);
    w.sign = u.sign === v.sign ? 1 : -1;
    w.trim();

    // Adjust coefficient to match precision
    if (usePrecision) {
      const delta = w.precision() - scaleprec;
      if (delta > 0) {
        w._shiftright(delta, rounding);
      }
    } else {
      w._setScale(scaleprec, rounding);
    }
    return w;
  }

  /**
   * Divide by v with optional math context.
   */
  divide(v: DecimalArg, context?: MathContext): Decimal {
    v = coerceDecimal(v);
    const r = this.handleFlags(Op.DIVISION, v);
    if (r !== undefined) {
      return r;
    }

    const [usePrecision, scaleprec, rounding] = parseMathContext('half-even', context);

    let u: Decimal = this;
    if (!usePrecision) {
      // Shift the numerator to ensure the result has the desired scale.
      const sh = scaleprec + v.scale();
      if (sh > 0) {
        u = u.shiftleft(sh);
        u.exp -= sh;
      }
    }

    const w = new Decimal(ZERO);

    // Shift in extra digits for rounding.
    let shift = 2;

    // In precision mode, ensure shift takes into account target precision
    if (usePrecision) {
      shift += (v.precision() - u.precision()) + scaleprec;
    }

    // Calculate the exponent on the result
    const exp = (u.exp - v.exp) - shift;

    // Shift numerator or denominator
    if (shift > 0) {
      u = u.shiftleft(shift);
    } else if (shift < 0) {
      v = v.shiftleft(-shift);
    }

    // Perform the division.
    const [q, rem] = divide(u.data, v.data, false);
    w.data = q;
    w.sign = u.sign === v.sign ? 1 : -1;
    w.exp = exp;
    w.trim();

    const hasrem = rem.length && rem[rem.length - 1] !== 0;
    if (hasrem) {
      const lsd = w.data[0] % 10;
      if (lsd === 0 || lsd === 5) {
        w.data[0]++;
      }
    }

    if (usePrecision) {
      // Adjust precision to match context
      const delta = w.precision() - scaleprec;
      if (delta > 0) {
        w._shiftright(delta, rounding);
      }
    } else {
      // Adjust scale to match context
      w._setScale(scaleprec, rounding);
    }
    if (usePrecision) {
      w._stripTrailingZeros();
    }
    return w;
  }

  /**
   * Divide by v and return the quotient and remainder.
   */
  divmod(v: DecimalArg): [Decimal, Decimal] {
    v = coerceDecimal(v);
    const rq = this.handleFlags(Op.DIVISION, v);
    if (rq !== undefined) {
      const rm = this.handleFlags(Op.MOD, v)!;
      return [rq, rm];
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

    // Ensure u digits are >= v
    const dsize = v.data.length - u.data.length;
    if (dsize > 0) {
      if (u === this) {
        u = new Decimal(u);
      }
      for (let i = 0; i < dsize; i++) {
        u.data.push(0);
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
   * Divide by v and return the remainder.
   */
  mod(v: DecimalArg): Decimal {
    v = coerceDecimal(v);
    const r = this.handleFlags(Op.MOD, v);
    return r === undefined ? this.divmod(v)[1] : r;
  }

  /**
   * Number of trailing zeros.
   */
  trailingZeros(): number {
    if (this.flag) {
      return 0;
    }
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
    if (this.flag) {
      return this;
    }
    const r = new Decimal(this);
    r._stripTrailingZeros();
    return r;
  }

  /**
   * Return a scientific representation of the number,
   * Decimal coefficient and adjusted exponent.
   */
  scientific(minIntDigits: number = 1): [Decimal, number] {
    if (this.flag) {
      return [this, 0];
    }
    minIntDigits = minIntDigits <= 1 ? 1 : minIntDigits;
    const exp = -(this.precision() - 1) + (minIntDigits - 1);
    // ensure exponent is not negative zero
    const coeff = Decimal.fromRaw(this.sign, exp === 0 ? 0 : exp, this.data, this.flag);
    return [
      coeff,
      this.exp - coeff.exp
    ];
  }

  /**
   * Number of digits in the unscaled value.
   */
  precision(): number {
    if (this.flag) {
      return 0;
    }
    if (this.sign === 0) {
      return 1;
    }
    const len = this.data.length;
    return ((len - 1) * Constants.RDIGITS) + digitCount(this.data[len - 1]);
  }

  /**
   * Scale is the number of digits to the right of the decimal point.
   */
  scale(): number {
    return this.flag ? 0 : this.exp === 0 ? 0 : -this.exp;
  }

  /**
   * Number of integer digits, 1 or higher.
   */
  integerDigits(): number {
    return this.flag ? 0 : Math.max(this.precision() + this.exp, 1);
  }

  /**
   * Returns a new number with the given scale, shifting the coefficient as needed.
   */
  setScale(scale: number, roundingMode: RoundingModeType = 'half-even'): Decimal {
    if (this.flag) {
      return this;
    }
    const r: Decimal = new Decimal(this);
    r._setScale(floor(scale), roundingMode);
    return r;
  }

  /**
   * Adjusted exponent for alignment. Two numbers with the same aligned exponent are
   * aligned for arithmetic operations. If the aligned exponents do not match one
   * number must be shifted.
   */
  alignexp(): number {
    return this.flag ? 0 : (this.exp + this.precision()) - 1;
  }

  /**
   * Move the decimal point -n (left) or +n (right) places. Does not change
   * precision, only affects the exponent.
   */
  movePoint(n: number): Decimal {
    if (this.flag) {
      return this;
    }
    const w = new Decimal(this);
    w.exp += floor(n);
    return w;
  }

  /**
   * Shifts all digits to the left, increasing the precision.
   */
  shiftleft(shift: number): Decimal {
    if (this.flag) {
      return this;
    }
    const w = new Decimal(this);
    w._shiftleft(floor(shift));
    return w;
  }

  /**
   * Shifts all digits to the right, reducing the precision. Result is rounded
   * using the given rounding mode.
   */
  shiftright(shift: number, mode: RoundingModeType = 'half-even'): Decimal {
    if (this.flag) {
      return this;
    }
    const w = new Decimal(this);
    w._shiftright(floor(shift), mode);
    return w;
  }

  /**
   * Increment the least-significant integer digit.
   */
  increment(): Decimal {
    if (this.flag) {
      return this;
    }
    const r = new Decimal(this);
    if (r.sign === -1 || r.exp !== 0) {
      return r.add(DecimalConstants.ONE);
    }
    r._increment();
    return r;
  }

  /**
   * Decrement the least-significant integer digit.
   */
  decrement(): Decimal {
    return this.flag ? this : this.subtract(DecimalConstants.ONE);
  }

  /**
   * Format the number to a string, using fixed point.
   */
  toString(): string {
    return this.flag ? this.formatFlags() : this.formatString(this, 1);
  }

  /**
   * Format this number to scientific notation as a string.
   */
  toScientificString(minIntegers: number = 1): string {
    if (this.flag) {
      return this.formatFlags();
    }
    const [coeff, exp] = this.scientific(minIntegers);
    const r = this.formatString(coeff, minIntegers);
    return coeff.sign === 0 ? r :
      exp === 0 ? r : r + `E${exp > 0 ? '+' : ''}${exp}`;
  }

  /**
   * Format this number to an array of parts.
   */
  toParts(): Part[] {
    return this.flag ? this.formatFlagsParts() : this.formatParts(this, 1);
  }

  /**
   * Format this number to scientific notation as an array of parts.
   */
  toScientificParts(minIntegers: number = 1): Part[] {
    if (this.flag) {
      return this.formatFlagsParts();
    }
    const [coeff, exp] = this.scientific(minIntegers);
    const r = this.formatParts(coeff, minIntegers);
    if (coeff.sign === 0 || exp === 0) {
      return r;
    }
    const sign = exp < 0 ?
      { type: 'minus', value: '-' } : { type: 'plus', value: '+' };
    return r.concat([
      { type: 'exp', value: 'E' },
      sign,
      { type: 'integer', value: `${Math.abs(exp)}`}
    ]);
  }

  /**
   * Low-level formatting of string and Part[] forms.
   */
  format<R>(
    formatter: DecimalFormatter<R>, decimal: string, group: string, minInt: number,
    minGroup: number, priGroup: number, secGroup: number, zeroScale: boolean, digits: string[] = DECIMAL_DIGITS): void {

    // Determine if grouping is enabled, and set the primary and
    // secondary group sizes.
    const grouping = group !== '';
    if (secGroup <= 0) {
      secGroup = priGroup;
    }

    let exp = this.exp;

    // Determine how many integer digits to emit. If integer digits is
    // larger than the integer coefficient we emit leading zeros.
    let int = this.data.length === 0 ? 1 : this.precision() + exp;

    if (minInt <= 0 && this.compare(ONE, true) === -1) {
      // If the number is between 0 and 1 and format requested minimum
      // integer digits of zero, don't emit a leading zero digit.
      int = 0;
    } else {
      int = Math.max(int, minInt);
    }

    // Array to append digits in reverse order
    const len = this.data.length;
    let groupSize = priGroup;
    let emitted = 0;

    // Determine if grouping should be active.
    let groupFunc = GROUP_NOOP;
    if (grouping && priGroup > 0 && int >= minGroup + priGroup) {
      groupFunc = () => {
        if (emitted > 0 && emitted % groupSize === 0) {
          // Push group character, reset emitted digits, and switch
          // to secondary grouping size.
          formatter.add(group);
          emitted = 0;
          groupSize = secGroup;
        }
      };
    }

    // Push trailing zeros for a positive exponent, only if the number
    // is non-zero
    let zeros = exp;
    if (this.sign !== 0) {
      while (zeros > 0) {
        formatter.add(digits[0]);
        emitted++;
        int--;
        if (int > 0) {
          groupFunc();
        }
        zeros--;
      }
    } else if (zeroScale && exp < 0) {
      // Handle sign of zero which means we have exactly '0'. If we
      // have the 'zeroScale' flag set, a negative exponent here will
      // emit zeros after the decimal point.
      while (exp < 0) {
        exp++;
        formatter.add(digits[0]);
      }
      formatter.add(decimal);
    }

    // Scan coefficient from least- to most-significant digit.
    const last = len - 1;
    for (let i = 0; i < len; i++) {
      // Count the decimal digits c in this radix digit d
      let d = this.data[i];
      const c = i === last ? digitCount(d) : Constants.RDIGITS;

      // Loop over the decimal digits
      for (let j = 0; j < c; j++) {
        // Push decimal digit
        formatter.add(digits[d % 10]);
        d = (d / 10) | 0;

        // When we've reached exponent of 0, push the decimal point.
        exp++;
        if (exp === 0) {
          formatter.add(decimal);
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
    if (this.sign !== 0) {
      while (exp < 0) {
        formatter.add(digits[0]);

        // When we've reached exponent of 0, push the decimal point
        exp++;
        if (exp === 0) {
          formatter.add(decimal);
        }
      }
    }

    // Leading integer zeros
    while (int > 0) {
      formatter.add(digits[0]);
      emitted++;
      int--;
      if (int > 0) {
        groupFunc();
      }
    }
  }

  protected formatFlags(): string {
    switch (this.flag) {
      case DecimalFlag.NAN:
        return 'NaN';
      case DecimalFlag.INFINITY:
      default:
        return this.sign === 1 ? 'Infinity' : '-Infinity';
    }
  }

  protected formatFlagsParts(): Part[] {
    switch (this.flag) {
      case DecimalFlag.NAN:
        return [{ type: 'nan', value: 'NaN' }];
      case DecimalFlag.INFINITY:
      default:
        const s = this.sign === 1 ? 'Infinity' : '-Infinity';
        return [{ type: 'infinity', value: s }];
    }
  }

  protected formatString(d: Decimal, minInt: number): string {
    const f = new StringDecimalFormatter();
    d.format(f, '.', '', minInt, 1, 3, 3, false);
    const r = f.render();
    return d.sign === -1 ? '-' + r : r;
  }

  protected formatParts(d: Decimal, minInt: number): Part[] {
    const f = new PartsDecimalFormatter('.', '');
    d.format(f, '.', '', minInt, 1, 3, 3, false);
    const r = f.render();
    return d.sign === -1 ? [{ type: 'minus', value: '-' }].concat(r) : r;
  }

  /**
   * Handle setting of flags for operations per the IEEE-754-2008 specification.
   * These rules are also referenced in the EcmaScript specification:
   *
   * 12.7.3.1 - Applying the mul operator:
   * https://tc39.github.io/ecma262/#sec-applying-the-mul-operator
   *
   * 12.7.3.2 - Applying the div operator:
   * https://tc39.github.io/ecma262/#sec-applying-the-div-operator
   *
   * 12.7.3.3 - Applying the mod operator:
   * https://tc39.github.io/ecma262/#sec-applying-the-mod-operator
   *
   * 12.8.5 - Applying the additive operators to numbers:
   * https://tc39.github.io/ecma262/#sec-applying-the-additive-operators-to-numbers
   *
   */
  protected handleFlags(op: Op, v: Decimal): Decimal | undefined {
    const u = this as Decimal;
    const uflag = u.flag;
    const vflag = v.flag;

    // Any operation involving a NAN returns a NAN
    if (uflag === DecimalFlag.NAN || vflag === DecimalFlag.NAN) {
      return NAN;
    }

    const uinf = u.flag === DecimalFlag.INFINITY;
    const vinf = v.flag === DecimalFlag.INFINITY;
    const uzero = !uflag && !u.sign;
    const vzero = !vflag && !v.sign;

    switch (op) {
      case Op.ADDITION:
        if (uinf && vinf) {
          return u.sign === v.sign ? (u.sign === 1 ? POSITIVE_INFINITY : NEGATIVE_INFINITY) : NAN;
        } else if (uinf || vinf) {
          return uinf ? u : v;
        }
        break;

      case Op.SUBTRACTION:
        if (uinf && vinf) {
          return u.sign === v.sign ? NAN : u.sign === 1 ? POSITIVE_INFINITY : NEGATIVE_INFINITY;
        } else if (uinf || vinf) {
          return uinf ? (u.sign === 1 ? POSITIVE_INFINITY : NEGATIVE_INFINITY)
            : v.sign === 1 ? NEGATIVE_INFINITY : POSITIVE_INFINITY;
        }
        break;

      case Op.MULTIPLICATION:
        if (uinf) {
          return vzero ? NAN : u.sign === v.sign ? POSITIVE_INFINITY : NEGATIVE_INFINITY;
        }
        if (vinf) {
          return uzero ? NAN : u.sign === v.sign ? POSITIVE_INFINITY : NEGATIVE_INFINITY;
        }
        break;

      case Op.DIVISION:
        if (uinf && vinf) {
          return NAN;
        }
        if (uinf) {
          return vzero ? (u.sign === 1 ? POSITIVE_INFINITY : NEGATIVE_INFINITY) :
            u.sign === v.sign ? POSITIVE_INFINITY : NEGATIVE_INFINITY;
        }
        if (vinf) {
          return ZERO;
        }
        if (vzero) {
          return uzero ? NAN : u.sign === 1 ? POSITIVE_INFINITY : NEGATIVE_INFINITY;
        }
        break;

      case Op.MOD:
        if (uinf || vzero) {
          return NAN;
        }
        if (!uinf && vinf) {
          return u;
        }
        if (uzero && (!vzero && !vinf)) {
          return u;
        }
        break;
    }

    return undefined;
  }

  protected static fromRaw(sign: number, exp: number, data: number[], flag: DecimalFlag): Decimal {
    return new this({ sign, exp, data, flag } as any as Decimal);
  }

  /**
   * Mutating in-place shift left.
   */
  protected _shiftleft(shift: number): void {
    if (shift <= 0 || this.sign === 0) {
      return;
    }
    const w: Decimal = this;
    const prec = w.precision();
    const data = w.data.slice();
    w.data.fill(0);

    let m = data.length;

    // Compute the shift in terms of our radix.
    const q = (shift / Constants.RDIGITS) | 0;
    const r = shift - q * Constants.RDIGITS;

    // Expand w to hold shifted result and zero all elements.
    let n = size(prec + shift);
    w.data = new Array(n);
    w.data.fill(0);

    // Trivial case where shift is a multiple of our radix.
    if (r === 0) {
      while (--m >= 0) {
        w.data[m + q] = data[m];
      }
      return;
    }

    // Shift divided by radix leaves a remainder.
    const powlo = POWERS10[r];
    const powhi = POWERS10[Constants.RDIGITS - r];
    let hi = 0;
    let lo = 0;
    let loprev = 0;

    n--;
    m--;
    hi = (data[m] / powhi) | 0;
    loprev = data[m] - hi * powhi;
    if (hi !== 0) {
      w.data[n] = hi;
      n--;
    }
    m--;

    // Divmod each element of u, copying the hi/lo parts to w.
    for (; m >= 0; m-- , n--) {
      hi = (data[m] / powhi) | 0;
      lo = data[m] - hi * powhi;
      w.data[n] = powlo * loprev + hi;
      loprev = lo;
    }

    w.data[q] = powlo * loprev;
  }

  /**
   * Mutating in-place shift right.
   */
  protected _shiftright(shift: number, mode: RoundingModeType = 'half-even'): void {
    if (shift <= 0) {
      return;
    }
    if (this.sign === 0) {
      this.exp += shift;
      return;
    }
    const w: Decimal = this;
    const data = w.data.slice();
    w.data.fill(0);

    const div = new DivMod();
    const [q, r] = div.word(shift, Constants.RDIGITS);

    let i = 0, j = 0;
    let rnd = 0, rest = 0;

    if (r === 0) {
      if (q > 0) {
        [rnd, rest] = div.pow10(data[q - 1], Constants.RDIGITS - 1);
        if (rest === 0) {
          rest = allzero(data, q - 1) === 0 ? 1 : 0;
        }
      }
      for (j = 0; j < data.length - q; j++) {
        w.data[j] = data[q + j];
      }
      w.exp += shift;
      if (w.round(rnd, rest, mode)) {
        w._increment();
      }
      w.trim();
      return;
    }

    let hiprev = 0;
    const ph = POWERS10[Constants.RDIGITS - r];
    [hiprev, rest] = div.pow10(data[q], r);
    [rnd, rest] = div.pow10(rest, r - 1);
    if (rest === 0 && q > 0) {
      rest = allzero(data, q) === 0 ? 1 : 0;
    }

    for (j = 0, i = q + 1; i < data.length; i++ , j++) {
      const [hi, lo] = div.pow10(data[i], r);
      w.data[j] = ph * lo + hiprev;
      hiprev = hi;
    }
    if (hiprev !== 0) {
      w.data[j] = hiprev;
    }

    w.exp += shift;
    if (w.round(rnd, rest, mode)) {
      w._increment();
    }
    w.trim();
  }

  protected _setScale(scale: number, roundingMode: RoundingModeType = 'half-even'): void {
    const diff = scale - this.scale();
    if (diff > 0) {
      this._shiftleft(diff);
    } else {
      this._shiftright(-diff, roundingMode);
    }
    this.exp = scale === 0 ? 0 : -scale;
  }

  protected _stripTrailingZeros(): void {
    let n = 0;
    // Special case for zero with negative exponent
    if (this.sign === 0 && this.exp < 0) {
      n = -this.exp;
    } else {
      n = this.trailingZeros();
    }
    if (n > 0) {
      this._shiftright(n, 'down');
    }
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
   * Increment the least-significant digit of the coefficient.
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
  protected round(rnd: number, rest: number, mode: RoundingModeType): number {
    if (rest !== 0 && (rnd === 0 || rnd === 5)) {
      rnd++;
    }
    switch (mode) {
      case 'up':
        // round away from zero
        return Number(rnd !== 0);
      case 'down':
        // round towards zero
        return 0;
      case 'ceiling':
        // round towards positive infinity
        return Number(!(rnd === 0 || this.sign === -1));
      case 'floor':
        // round towards negative infinity
        return Number(!(rnd === 0 || this.sign >= 0));
      case 'half-up':
        // if n >= 5 round up; otherwise round down
        return Number(rnd >= 5);
      case 'half-down':
        // if n > 5 round up; otherwise round down
        return Number(rnd > 5);
      case 'half-even':
        // if n = 5 and digit to left of n is odd round up; if even round down
        return Number((rnd > 5) || ((rnd === 5 && this.isodd())));
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
    if (u.flag) {
      return u;
    }
    if (v.flag) {
      return v;
    }
    const zero = u.sign === 0;
    if (zero || v.sign === 0) {
      return zero ? Decimal.fromRaw(vsign, v.exp, v.data, v.flag) : new Decimal(u);
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
    if (typeof arg === 'number') {
      if (isNaN(arg)) {
        this.flag = DecimalFlag.NAN;
        return;
      }
      if (!isFinite(arg)) {
        this.flag = DecimalFlag.INFINITY;
        this.sign = arg === Infinity ? 1 : -1;
        return;
      }
    }

    const str: string = typeof arg === 'string' ? arg : arg.toString();
    const msg = this._parse(str);
    if (msg !== undefined) {
      throw new Error(msg);
    }
  }

  /**
   * Parse a string into a Decimal.
   *
   * Expects strings of the form:
   *    "[-+][digits][.][digits][eE][-+][digits]"
   * or:
   *    "[nN]a[nN]"        for a NaN
   *    "[-+]?[iI]nfinity" for positive or negative infinity
   */
  protected _parse(str: string): string | undefined {
    if (NAN_VALUES.has(str)) {
      this.flag = DecimalFlag.NAN;
      return;
    }
    if (POS_INFINITY.has(str)) {
      this.flag = DecimalFlag.INFINITY;
      this.sign = 1;
      return;
    }
    if (NEG_INFINITY.has(str)) {
      this.flag = DecimalFlag.INFINITY;
      this.sign = -1;
      return;
    }

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

const ZERO = new Decimal('0');
const ONE = new Decimal('1');
const TWO = new Decimal('2');

// 105 digits of pi - https://oeis.org/A000796/constant
const PI = new Decimal(
  '3.141592653589793238462643383279502884197169399375105' +
  '82097494459230781640628620899862803482534211706798214');

// 105 digits of e - https://oeis.org/A001113/constant
const E = new Decimal(
  '2.718281828459045235360287471352662497757247093699959' +
  '57496696762772407663035354759457138217852516642742746'
);

const NAN = new Decimal(NaN);
const NEGATIVE_INFINITY = new Decimal(-Infinity);
const POSITIVE_INFINITY = new Decimal(Infinity);

export const DecimalConstants = {
  ZERO,
  ONE,
  TWO,
  PI,
  E,
  NAN,
  POSITIVE_INFINITY,
  NEGATIVE_INFINITY
};

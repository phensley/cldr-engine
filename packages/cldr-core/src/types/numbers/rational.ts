import { Decimal, DecimalArg, DecimalConstants } from './decimal';
import { MathContext } from './types';

const coerceDecimal = (n: DecimalArg): Decimal => {
  if (typeof n === 'number') {
    return new Decimal(n);
  } else if (typeof n === 'string') {
    return fromString(n);
  }
  return n;
};

const coerceRational = (n: RationalArg): Rational => {
  if (typeof n === 'number') {
    return new Rational(n, DecimalConstants.ONE);
  } else if (typeof n === 'string') {
    return new Rational(n);
  } else if (n instanceof Rational) {
    return n as Rational;
  }
  return new Rational(n, DecimalConstants.ONE);
};

/**
 * Default Rational parser, to identify named constants.
 */
const fromString = (s: string): Decimal => {
  switch (s.toLowerCase()) {
  case 'e':
    return DecimalConstants.E;
  case 'pi':
    return DecimalConstants.PI;
  default:
    return new Decimal(s);
  }
};

export type RationalArg = Rational | Decimal | number | string;

/**
 * Arbitrary precision rational type.
 *
 * @alpha
 */
export class Rational {

  protected numer!: Decimal;
  protected denom!: Decimal;

  constructor(
    numerator: DecimalArg,
    denominator?: DecimalArg) {

    if (typeof numerator === 'string' && denominator === undefined) {
      this._parse(numerator);
    } else {
      denominator = denominator === undefined ? DecimalConstants.ONE : denominator;
      this.numer = coerceDecimal(numerator);
      this.denom = coerceDecimal(denominator);
    }
  }

  numerator(): Decimal {
    return this.numer;
  }

  denominator(): Decimal {
    return this.denom;
  }

  compare(num: RationalArg, context?: MathContext): number {
    const u: Rational = this;
    const v = coerceRational(num);
    const a = u.numer.multiply(v.denom, context);
    const b = v.numer.multiply(u.denom, context);
    return a.compare(b);
  }

  divide(num: RationalArg, context?: MathContext): Rational {
    const n = coerceRational(num);
    return new Rational(
      this.numer.multiply(n.denom, context),
      this.denom.multiply(n.numer, context)
    );
  }

  multiply(num: RationalArg, context?: MathContext): Rational {
    const n = coerceRational(num);
    return new Rational(
      this.numer.multiply(n.numer, context),
      this.denom.multiply(n.denom, context)
    );
  }

  inverse(): Rational {
    return new Rational(this.denom, this.numer);
  }

  toDecimal(context?: MathContext): Decimal {
    return this.numer.divide(this.denom, context);
  }

  toString(): string {
    return `${this.numer.toString()} / ${this.denom.toString()}`;
  }

  private _parse(raw: string): void {
    const i = raw.indexOf('/');
    if (i === -1) {
      this.numer = fromString(raw);
      this.denom = DecimalConstants.ONE;
    } else {
      this.numer = fromString(raw.substring(0, i).trim());
      this.denom = fromString(raw.substring(i + 1).trim());
    }
  }

}

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
    return Rational.parse(n);
  } else if (n instanceof Rational || (n as any).numerator !== undefined) {
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

  readonly numerator: Decimal;
  readonly denominator: Decimal;

  constructor(
    numerator: DecimalArg,
    denominator: DecimalArg = DecimalConstants.ONE) {

    this.numerator = coerceDecimal(numerator);
    this.denominator = coerceDecimal(denominator);
  }

  static parse(raw: string): Rational {
    const i = raw.indexOf('/');
    if (i === -1) {
      return new Rational(raw, DecimalConstants.ONE);
    }
    const numerator = raw.substring(0, i).trim();
    const denominator = raw.substring(i + 1).trim();
    return new Rational(numerator, denominator);
  }

  compare(num: RationalArg, context?: MathContext): number {
    const n = coerceRational(num);
    const a = this.numerator.multiply(n.denominator, context);
    const b = n.numerator.multiply(this.denominator, context);
    return a.compare(b);
  }

  divide(num: RationalArg, context?: MathContext): Rational {
    const n = coerceRational(num);
    return new Rational(
      this.numerator.multiply(n.denominator, context),
      this.denominator.multiply(n.numerator, context)
    );
  }

  multiply(num: RationalArg, context?: MathContext): Rational {
    const n = coerceRational(num);
    return new Rational(
      this.numerator.multiply(n.numerator, context),
      this.denominator.multiply(n.denominator, context)
    );
  }

  inverse(): Rational {
    return new Rational(this.denominator, this.numerator);
  }

  toDecimal(context?: MathContext): Decimal {
    if (context === undefined) {
      context = { precision: this.numerator.precision() + this.denominator.precision() };
    }
    return this.numerator.divide(this.denominator, context);
  }

}

import { Decimal, PI, E } from './decimal';

const parse = (s: string): Decimal => {
  switch (s.toLowerCase()) {
  case 'e':
    return E;
  case 'pi':
    return PI;
  default:
    return new Decimal(s);
  }
};

export class Rational {

  constructor(
    private numerator: string | Decimal,
    private denominator: string | Decimal) { }

  static parse(raw: string): Rational {
    const i = raw.indexOf('/');
    if (i === -1) {
      throw new Error('Rational must be of the form n/d');
    }
    const numerator = raw.substring(0, i).trim();
    const denominator = raw.substring(i + 1).trim();
    return new Rational(parse(numerator), parse(denominator));
  }

}

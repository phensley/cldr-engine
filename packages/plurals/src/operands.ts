import { Decimal } from '@phensley/decimal';

const ZERO = new Decimal('0');

const FIELDS = ['n', 'i', 'v', 'w', 'f', 't'];

const fracs = (a: Decimal, b: Decimal) => {
  const n = a.subtract(b).abs();
  const s = n.scale();
  return s > 0 ? n.movePoint(s) : n;
};

const scale = (n: Decimal) => {
  const s = n.scale();
  return s > 0 ? new Decimal(s) : ZERO;
};

/**
 * Computes each number operands field as needed.
 */
export class NumberOperands {
  private _d: Decimal;
  private _n?: Decimal;
  private _i?: Decimal;
  private _v?: Decimal;
  private _w?: Decimal;
  private _f?: Decimal;
  private _t?: Decimal;

  constructor(d: Decimal) {
    this._d = d.isFinite() ? d.abs() : ZERO;
  }

  get n(): Decimal {
    if (!this._n) {
      // The 'n' operand must strip trailing zeros for integer comparison
      this._n = this._d.stripTrailingZeros();
    }
    return this._n;
  }

  get i(): Decimal {
    if (!this._i) {
      this._i = this._d.toInteger();
    }
    return this._i;
  }

  get v(): Decimal {
    if (!this._v) {
      this._v = scale(this._d);
    }
    return this._v;
  }

  get w(): Decimal {
    if (!this._w) {
      this._w = scale(this.n);
    }
    return this._w;
  }

  get f(): Decimal {
    if (!this._f) {
      this._f = fracs(this._d, this.i);
    }
    return this._f;
  }

  get t(): Decimal {
    if (!this._t) {
      this._t = fracs(this.n, this.i);
    }
    return this._t;
  }

  toString(): string {
    return FIELDS.map(f => `${f}: ${this[f as keyof NumberOperands].toString()}`).join(', ');
  }

}

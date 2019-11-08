import { Decimal } from '@phensley/decimal';

const ZERO = new Decimal('0');

const FIELDS = ['n', 'i', 'v', 'w', 'f', 't'];

const fracs = (a: Decimal, b: Decimal) => {
  const n = a.subtract(b);
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
  private n: Decimal;
  private _i?: Decimal;
  private _v?: Decimal;
  private _w?: Decimal;
  private _f?: Decimal;
  private _t?: Decimal;

  private _nz?: Decimal;

  constructor(d: Decimal) {
    this.n = d.isFinite() ? d.abs() : ZERO;
  }

  get i(): Decimal {
    if (!this._i) {
      this._i = this.n.toInteger();
    }
    return this._i;
  }

  get v(): Decimal {
    if (!this._v) {
      this._v = scale(this.n);
    }
    return this._v;
  }

  get w(): Decimal {
    if (!this._w) {
      this._w = scale(this.nz);
    }
    return this._w;
  }

  get f(): Decimal {
    if (!this._f) {
      this._f = fracs(this.n, this.i);
    }
    return this._f;
  }

  get t(): Decimal {
    if (!this._t) {
      this._t = fracs(this.nz, this.i);
    }
    return this._t;
  }

  toString(): string {
    return FIELDS.map(f => `${f}: ${this[f as keyof NumberOperands].toString()}`).join(', ');
  }

  protected get nz(): Decimal {
    if (!this._nz) {
      this._nz = this.n.stripTrailingZeros();
    }
    return this._nz;
  }
}

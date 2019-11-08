import { Decimal } from '@phensley/decimal';

const ZERO = new Decimal('0');

export interface NumberOperands {
  n: Decimal;
  i: Decimal;
  v: Decimal;
  w: Decimal;
  f: Decimal;
  t: Decimal;
}

const ZERO_OPS: NumberOperands = {
  n: ZERO,
  i: ZERO,
  v: ZERO,
  w: ZERO,
  f: ZERO,
  t: ZERO
};

export const numberOperands = (d: Decimal): NumberOperands => {
  if (!d.isFinite()) {
    return ZERO_OPS;
  }

  // n - absolute value of the source number (integer and decimals)
  const n = d.abs();

  // i - integer digits of n
  const i = n.toInteger();

  // v - number of visible fraction digits in n, with trailing zeroes
  const nsc = n.scale();
  const v = nsc > 0 ? new Decimal(nsc) : ZERO;

  // w - number of visible fraction digits in n, without trailing zeroes
  const nz = n.stripTrailingZeros();
  const nzsc = nz.scale();
  const w = nzsc > 0 ? new Decimal(nzsc) : ZERO;

  // f - visible fractional digits in n, with trailing zeros
  let f = n.subtract(i);
  const fsc = f.scale();
  if (fsc > 0) {
    f = f.movePoint(fsc);
  }

  // t - visible fractional digits in n, without trailing zeros
  let t = nz.subtract(i);
  const tsc = t.scale();
  if (tsc > 0) {
    t = t.movePoint(tsc);
  }

  return { n, i, v, w, f, t };
};

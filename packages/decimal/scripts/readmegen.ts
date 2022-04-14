import { Decimal, DecimalConstants, MathContext } from '../src';

const area = (radius: Decimal, ctx: MathContext) =>
  DecimalConstants.PI.multiply(radius, ctx).multiply(radius, ctx);

const calc = (ctx: MathContext) => {
  for (const r of ['.002', '1', '1.5', '999.999']) {
    const radius = new Decimal(r);
    console.log(`area of circle with radius ${r.padEnd(7)} is ${area(radius, ctx)}`);
  }
  console.log();
};

for (const scale of [5, 15]) {
  console.log(`Scale ${scale}:`);
  calc({ scale });
}

for (const precision of [10, 30]) {
  console.log(`Precision ${precision}:`);
  calc({ precision });
}

const LIGHT_YEAR_KM = new Decimal('9.461e12');
const NEAREST_STARS: any = {
  'Proxima Centauri': '4.32',
  'Barnard\'s Star': '5.96',
  'Wolf 359': '7.78',
  'Lalande 21185': '8.29'
};

for (const name of Object.keys(NEAREST_STARS)) {
  const distly = NEAREST_STARS[name];
  const distkm = new Decimal(distly).multiply(LIGHT_YEAR_KM, { precision: 30 });
  console.log(`Distance to ${name.padEnd(16)} is ${distkm.toString()} kilometers`);
}

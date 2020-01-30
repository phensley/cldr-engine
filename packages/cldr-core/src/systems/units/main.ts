import { UnitType } from '@phensley/cldr-types';
import { Decimal } from '@phensley/decimal';
import { UnitFactors } from './factors';
import { UnitFactorMap } from './factormap';

const main = () => {
  const map = new UnitFactorMap('area', UnitFactors.area);
  // console.log('\n\n' + map.dump());
  let r: Decimal;

  const n = new Decimal('5');
  const units: UnitType[] = ['acre', 'square-meter', 'square-mile', 'square-kilometer'];
  for (const u of units) {
    for (const v of units) {
      r = map.convert(n, u, v, { scale: 5 }).stripTrailingZeros();
      console.log(`${n.toString()} ${u} == ${r.toString()} ${v}`);
    }
    console.log('');
  }

  // const n = new Decimal('3');
  // const m = new Decimal('1');
  // console.log(m.divide(n, { scale: 5 }).toString());
};

main();

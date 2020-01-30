import { UnitType } from '@phensley/cldr-types';
import { Decimal, DecimalConstants } from '@phensley/decimal';
import { mplookup, MPHashTable } from '@phensley/cldr-utils';
import {
  unitCategories,
  unitCategoryMapG,
  unitCategoryMapS,
  unitCategoryMapV
} from './autogen.units';
import { UnitFactorMap } from './factormap';

const CATEGORY_MAP: MPHashTable<number> = {
  g: unitCategoryMapG,
  v: unitCategoryMapV as number[],
  s: unitCategoryMapS
};

for (const u of ['acre', 'kilogram', 'gigabyte', 'cubic-meter']) {
  const i = mplookup(CATEGORY_MAP, u);
  console.log(`${u} is in ${unitCategories[i]}`);
}

export class UnitConverter {

  constructor(readonly units: UnitType[], readonly factors: UnitFactorMap[]) {
  }

  convert(n: Decimal, from: UnitType, to: UnitType): Decimal {
    const i = mplookup(CATEGORY_MAP, from);
    const j = mplookup(CATEGORY_MAP, to);
    if (typeof i !== 'number' && i !== j) {
      return DecimalConstants.ZERO;
    }
    // TODO:
    return new Decimal('1');
  }
}

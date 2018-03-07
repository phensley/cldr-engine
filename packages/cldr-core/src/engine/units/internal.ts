import {
  Bundle,
  Schema,
  UnitInfo,
  Units,
  UnitType
} from '@phensley/cldr-schema';

import { NumbersInternal, WrapperInternal } from '..';

export class UnitsInternal {

  readonly Units: Units;

  constructor(
    readonly root: Schema,
    readonly numbers: NumbersInternal,
    readonly wrapper: WrapperInternal,
    readonly cacheSize: number = 50
  ) {
    this.Units = root.Units;
  }

  getDisplayName(bundle: Bundle, name: UnitType, width: string): string {
    return this.getUnitInfo(bundle, name, width).displayName(bundle);
  }

  getUnitInfo(bundle: Bundle, name: UnitType, width: string): UnitInfo {
    switch (width) {
    case 'narrow':
      return this.Units.narrow(name);
    case 'short':
      return this.Units.short(name);
    case 'long':
    default:
      return this.Units.long(name);
    }
  }
}

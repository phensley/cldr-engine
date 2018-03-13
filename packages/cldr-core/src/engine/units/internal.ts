import {
  Bundle,
  FieldArrow,
  Schema,
  UnitInfo,
  Units,
  UnitType
} from '@phensley/cldr-schema';

import { WrapperInternal } from '..';
import { NumberContext } from '../numbers/context';
import { NumbersInternal } from '../numbers/internal';
import { NumberParams } from '../numbers/options';
import { Renderer } from '../numbers/render';
import { coerceDecimal, Decimal } from '../../types';
import { Cache } from '../../utils/cache';
import { Quantity, UnitFormatOptions } from './options';

export class UnitsInternal {

  readonly Units: Units;
  readonly standardFormat: FieldArrow;

  constructor(
    readonly root: Schema,
    readonly numbers: NumbersInternal,
    readonly wrapper: WrapperInternal,
    readonly cacheSize: number = 50
  ) {
    this.Units = root.Units;
    this.standardFormat = root.Numbers.decimalFormats.standard;
  }

  getDisplayName(bundle: Bundle, name: UnitType, length: string): string {
    return this.getUnitInfo(bundle, name, length).displayName(bundle);
  }

  format<T>(bundle: Bundle, renderer: Renderer<T>, q: Quantity, options: UnitFormatOptions, params: NumberParams): T {
    const n = coerceDecimal(q.value);
    const [num, plural] = this.numbers.formatDecimal(bundle, renderer, n, options, params);

    if (q.unit === undefined) {
      return num;
    }

    const info = this.getUnitInfo(bundle, q.unit, options.length || 'long');
    if (info === undefined) {
      return num;
    }

    const pattern = info.unitPattern(bundle, plural);
    return renderer.wrap(this.wrapper, pattern, num);
  }

  getUnitInfo(bundle: Bundle, name: UnitType, length: string): UnitInfo {
    switch (length) {
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

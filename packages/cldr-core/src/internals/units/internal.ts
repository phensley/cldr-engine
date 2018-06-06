import {
  FieldArrow,
  NumbersSchema,
  Schema,
  UnitsSchema,
  UnitInfo,
  UnitType
} from '@phensley/cldr-schema';

import { Internals, NumberInternals, NumberRenderer, UnitInternals, WrapperInternals } from '../internals';
import { NumberContext } from '../numbers/context';
import { Quantity, UnitFormatOptions } from '../../common';
import { NumberParams } from '../../common/private';
import { coerceDecimal, Decimal } from '../../types';
import { Cache } from '../../utils/cache';
import { Bundle } from '../../resource';

export class UnitsInternalImpl implements UnitInternals {

  readonly numbersSchema: NumbersSchema;
  readonly unitsSchema: UnitsSchema;

  constructor(readonly internals: Internals) {
    const schema = internals.schema;
    this.unitsSchema = schema.Units;
    this.numbersSchema = schema.Numbers;
  }

  getDisplayName(bundle: Bundle, name: UnitType, length: string): string {
    return this.getUnitInfo(length).displayName.get(bundle, name);
  }

  format<T>(bundle: Bundle, renderer: NumberRenderer<T>, q: Quantity,
    options: UnitFormatOptions, params: NumberParams): T {

    const n = coerceDecimal(q.value);
    const [num, plural] = this.internals.numbers.formatDecimal(bundle, renderer, n, options, params);
    if (q.unit === undefined) {
      return num;
    }

    const info = this.getUnitInfo(options.length || '');
    const pattern = info.unitPattern.get(bundle, plural, q.unit);
    return renderer.wrap(this.internals.wrapper, pattern, num);
  }

  getUnitInfo(length: string): UnitInfo {
    switch (length) {
    case 'narrow':
      return this.unitsSchema.narrow;
    case 'short':
      return this.unitsSchema.short;
    default:
      return this.unitsSchema.long;
    }
  }

}

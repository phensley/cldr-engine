import {
  NumbersSchema,
  UnitsSchema,
  UnitInfo,
  UnitType
} from '@phensley/cldr-schema';
import { coerceDecimal, DecimalConstants } from '@phensley/decimal';

import { Internals, NumberRenderer, UnitInternals } from '../internals';
import { Quantity, UnitFormatOptions } from '../../common';
import { NumberParams } from '../../common/private';
import { Bundle } from '../../resource';
import { pluralRules } from '../../systems/plurals';

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

    const { general } = this.internals;
    const info = this.getUnitInfo(options.length || '');
    const pattern = info.unitPattern.get(bundle, plural, q.unit);

    // Format argument '{0}' here. If no 'per' unit is defined, we
    // return it. Otherwise we join it with the denominator unit below.
    const zero = renderer.wrap(general, pattern, num);
    if (q.per) {
      // Check if the 'per' unit has a perUnitPattern defined and use it.
      const perPattern = info.perUnitPattern.get(bundle, q.per);
      if (perPattern) {
        return renderer.wrap(general, perPattern, zero);
      }

      // Fall back to use the compoundUnit pattern. See notes here:
      // https://www.unicode.org/reports/tr35/tr35-general.html#perUnitPatterns
      const compound = info.compoundUnitPattern.get(bundle);

      // Compute plural category for the value '1'
      const singular = pluralRules.cardinal(
        bundle.language(), DecimalConstants.ONE.operands());

      // Fetch the denominator's singular unit pattern, strip off the '{0}'
      // and any surrounding whitespace.
      let denom = info.unitPattern.get(bundle, singular, q.per);
      denom = denom.replace(/\s*\{0\}\s*/, '');
      const one = renderer.make('per', denom);

      // Wrap the numerator and denominator together
      return renderer.wrap(general, compound, zero, one);
    }

    return zero;
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

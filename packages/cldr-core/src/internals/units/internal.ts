import { PluralType, UnitsSchema, UnitInfo, UnitType } from '@phensley/cldr-types';

import { coerceDecimal, DecimalConstants } from '@phensley/decimal';

import { Internals, NumberRenderer, UnitInternals } from '../internals';
import { Quantity, UnitFormatOptions } from '../../common';
import { NumberParams } from '../../common/private';
import { Bundle } from '../../resource';

/**
 * @internal
 */
export class UnitsInternalImpl implements UnitInternals {
  private unitsSchema: UnitsSchema;

  constructor(private internals: Internals) {
    const schema = internals.schema;
    this.unitsSchema = schema.Units;
  }

  getDisplayName(bundle: Bundle, name: UnitType, length: string): string {
    return this.getUnitInfo(length).displayName.get(bundle, name);
  }

  format<T>(
    bundle: Bundle,
    renderer: NumberRenderer<T>,
    q: Quantity,
    options: UnitFormatOptions,
    params: NumberParams,
  ): T {
    const n = coerceDecimal(q.value);
    const [num, plural] = this.internals.numbers.formatDecimal(bundle, renderer, n, options, params);
    if (q.unit === undefined) {
      return num;
    }

    // Compute plural category for the value '1'
    const singular = bundle.plurals().cardinal(DecimalConstants.ONE);

    // For default and "per" compound pattern, the {0} will use
    // the plural category and {1} will be singular. Examples:
    //   1 meter per second
    //  10 meters per second
    //
    // For the 'times' compound pattern, the {0} will be singular,
    // and the {1} will use the plural category. Examples:
    //   1 newton-meter
    //  10 newton-meters

    const plural0 = q.times ? singular : plural;
    const plural1 = q.times ? plural : singular;

    const { general } = this.internals;
    const info = this.getUnitInfo(options.length || '');
    let pattern = info.unitPattern.get(bundle, plural0 as PluralType, q.unit);
    if (!pattern) {
      // Fallback to other. Some locales don't break out a pattern per category
      // when the patterns are identical
      pattern = info.unitPattern.get(bundle, 'other', q.unit);
    }

    // Format argument '{0}' here. If no 'per' unit is defined, we
    // return it. Otherwise we join it with the denominator unit below.
    const zero = renderer.wrap(general, pattern, num);
    if (q.per) {
      // Check if the 'per' unit has a perUnitPattern defined and use it.
      const perPattern = info.perUnitPattern.get(bundle, q.per);
      if (perPattern) {
        return renderer.wrap(general, perPattern, zero);
      }
    }

    // If per or times are specified, use use the corresponding compound pattern.
    // See notes here:
    // https://www.unicode.org/reports/tr35/tr35-general.html#perUnitPatterns
    const compound = q.per ? info.perPattern.get(bundle) : q.times ? info.timesPattern.get(bundle) : '';

    const perunit = q.per || q.times;
    if (perunit) {
      // Fetch the denominator's unit pattern, strip off the '{0}'
      // and any surrounding whitespace.
      let denom = info.unitPattern.get(bundle, plural1 as PluralType, perunit);
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

import {
  PluralType,
  RelativeTimes,
  RelativeTimeFields,
  RelativeTimeFieldType,
} from '@phensley/cldr-types';

import { coerceDecimal, DecimalArg, DecimalConstants } from '@phensley/decimal';

import { DateFieldInternals, Internals } from '../internals';
import { RelativeTimeFieldFormatOptions } from '../../common';
import { Bundle } from '../../resource';
import { ContextTransformInfo, NumberParams } from '../../common/private';

// TODO: expose a method to calculate field difference with different options, e.g.
// include weekdays

export class DateFieldInternalsImpl implements DateFieldInternals {

  readonly relativeTimes: RelativeTimes;

  constructor(
    readonly internals: Internals
  ) {
    this.relativeTimes = internals.schema.DateFields.relativeTimes;
  }

  // formatRelativeTime(bundle: Bundle, start: CalendarDate, end: CalendarDate,
    // options: RelativeTimeFormatOptions, params: NumberParams): string {
      // TODO: need to compute integral difference for multiple fields. for example, year
      // may differ between 2017-12-01 and 2018-02-02 but they are only 3 months apart, so
      // we might format "3 months" or "9 weeks" or "9 Fridays" or "63 days".
      // return '';
  // }

  formatRelativeTimeField(bundle: Bundle, value: DecimalArg, field: RelativeTimeFieldType,
      options: RelativeTimeFieldFormatOptions, params: NumberParams,
      transform: ContextTransformInfo): string {

    const width = options.width || 'wide';
    const format: RelativeTimeFields = this.relativeTimes[width] || this.relativeTimes.wide;
    const group = options.group === undefined ? true : options.group;

    let n = coerceDecimal(value);
    n = this.internals.numbers.adjustDecimal(n, options);
    const negative = n.isNegative();
    if (negative) {
      n = n.negate();
    }

    const iszero = n.compare(DecimalConstants.ZERO) === 0;
    let res = '';

    if (iszero) {
      if (options.alwaysNow || !options.numericOnly) {
        res = format.current.get(bundle, field);
      }

    } else if (!options.numericOnly) {
      switch (field) {
        case 'hour':
        case 'minute':
        case 'second':
          break;
        default:
          if (n.compare(DecimalConstants.TWO) === 0) {
            const p = negative ? format.previous2.get(bundle, field) : format.next2.get(bundle, field);
            if (p !== '') {
              res = p;
            }
            // Fall through
          } else if (n.compare(DecimalConstants.ONE) === 0) {
            res = negative ? format.previous.get(bundle, field) : format.next.get(bundle, field);
          }
          break;
      }
    }

    // If we output anything above, return it
    if (res) {
      if (options.context) {
        res = this.internals.general.contextTransform(res, transform,
          options.context, 'relative');
        }
        return res;
    }

    // Format a pluralized future / past.
    const plural = bundle.plurals().cardinal(n) as PluralType;
    const arrow = negative ? format.past : format.future;
    let raw = arrow.get(bundle, plural, field);
    if (options.context) {
      raw = this.internals.general.contextTransform(raw, transform,
        options.context, 'relative');
    }
    const num = params.system.formatString(n, group, 1);
    return this.internals.general.formatWrapper(raw, [num]);

  }
}

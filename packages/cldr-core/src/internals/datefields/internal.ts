import {
  RelativeTimes,
  RelativeTimeFields,
  RelativeTimeFieldType,
} from '@phensley/cldr-schema';

import { coerceDecimal, DecimalArg, DecimalConstants } from '../../types';
import { DateFieldInternals, Internals } from '../internals';
import { RelativeTimeFormatOptions } from '../../common';
import { Bundle } from '../../resource';
import { CalendarDate } from '../../systems/calendars';
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
      options: RelativeTimeFormatOptions, params: NumberParams,
      transform: ContextTransformInfo): string {

    let format: RelativeTimeFields;
    switch (options.width) {
    case 'narrow':
      format = this.relativeTimes.narrow;
      break;
    case 'short':
      format = this.relativeTimes.short;
      break;
    default:
      format = this.relativeTimes.wide;
      break;
    }

    let n = coerceDecimal(value);
    const negative = n.isNegative();
    if (negative) {
      n = n.negate();
    }

    let res = '';
    if (n.compare(DecimalConstants.ZERO) === 0) {
      res = format.current.get(bundle, field);

    } else {
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

    if (res) {
      if (options.context) {
        res = this.internals.general.contextTransform(res, options.context,
          'relative', transform);
        }
        return res;
    }

    // Format a pluralized future / past.
    const operands = n.operands();
    const plural = this.internals.plurals.cardinal(bundle.language(), operands);
    const arrow = negative ? format.past : format.future;
    let raw = arrow.get(bundle, plural, field);
    if (options.context) {
      raw = this.internals.general.contextTransform(raw, options.context,
        'relative', transform);
    }
    const num = params.system.formatString(n, false, 1);
    return this.internals.wrapper.format(raw, [num]);

  }
}

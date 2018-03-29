import {
  DateField,
  DateFieldType,
  DateFieldsSchema,
  Schema
} from '@phensley/cldr-schema';

import { coerceDecimal, Decimal, DecimalArg, DecimalConstants, ZonedDateTime } from '../../types';
import { DateFieldInternals, Internals, PluralInternals, WrapperInternals } from '..';
import { RelativeTimeFormatOptions } from '../../common';
import { Bundle } from '../../resource';

// TODO: expose a method to calculate field difference with different options
// export const fieldDifference = (a: ZonedDateTime, b: ZonedDateTime): [DateFieldType, number] => {
//   if (a.zoneId() !== b.zoneId()) {
//     b = new ZonedDateTime(b.epochUTC(), a.zoneId());
//   }

//   let diff = a.getYear() - b.getYear();
//   if (diff !== 0) {
//     return ['year', diff];
//   }

//   // TODO:
//   // diff = a.getMonth() - b.getMonth();
//   // if (diff !== 0) {

//   // }

//   diff = a.getSecond() - b.getSecond();
//   return ['second', diff];
// };

export class DateFieldInternalsImpl implements DateFieldInternals {

  readonly DateFields: DateFieldsSchema;

  constructor(
    readonly root: Schema,
    readonly plurals: PluralInternals,
    readonly wrapper: WrapperInternals
  ) {
    this.DateFields = root.DateFields;
  }

  formatRelativeTime(
    bundle: Bundle, value: DecimalArg, field: DateFieldType, options: RelativeTimeFormatOptions): string {
    const relative = this.DateFields.relativeTimes(field);
    if (relative === undefined) {
      return '';
    }
    const width = options.width || 'wide';
    const format = relative[width];
    if (format === undefined) {
      return '';
    }

    let n = coerceDecimal(value);
    const negative = n.isNegative();
    if (negative) {
      n = n.negate();
    }

    if (n.compare(DecimalConstants.ZERO) === 0) {
      return format.current(bundle);
    }

    switch (field) {
    case 'hour':
    case 'minute':
    case 'second':
      break;
    default:
      if (n.compare(DecimalConstants.TWO) === 0) {
        const p = negative ? format.previous2(bundle) : format.next2(bundle);
        if (p !== '') {
          return p;
        }
        // Fall through
      } else if (n.compare(DecimalConstants.ONE) === 0) {
        return negative ? format.previous(bundle) : format.next(bundle);
      }
      break;
    }

    const operands = n.operands();
    const plural = this.plurals.cardinal(bundle.language(), operands);
    const arrow = negative ? format.past.pattern : format.future.pattern;
    const raw = arrow(bundle, plural);
    return this.wrapper.format(raw, [n.toString()]);
  }

}

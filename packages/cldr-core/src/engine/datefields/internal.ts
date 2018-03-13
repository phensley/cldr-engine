import {
  Bundle,
  DateFields,
  DateField,
  DateFieldType,
  Schema
} from '@phensley/cldr-schema';

import { pluralCardinal } from '../plurals';
import { coerceDecimal, Decimal, DecimalArg, DecimalConstants, ZonedDateTime } from '../../types';
import { WrapperInternal } from '..';
import { RelativeTimeFormatOptions } from './options';

export const fieldDifference = (a: ZonedDateTime, b: ZonedDateTime): [DateFieldType, number] => {
  if (a.zoneId() !== b.zoneId()) {
    b = new ZonedDateTime(b.epochUTC(), a.zoneId());
  }

  let diff = a.getYear() - b.getYear();
  if (diff !== 0) {
    return ['year', diff];
  }

  // TODO:
  // diff = a.getMonth() - b.getMonth();
  // if (diff !== 0) {

  // }

  diff = a.getSecond() - b.getSecond();
  return ['second', diff];
};

export class DateFieldsInternal {

  readonly DateFields: DateFields;

  constructor(
    readonly root: Schema,
    readonly wrapper: WrapperInternal
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
      if (n.compare(DecimalConstants.ONE) === 0) {
        return negative ? format.previous(bundle) : format.next(bundle);
      }
      break;
    }

    const operands = n.operands();
    const plural = pluralCardinal(bundle.language(), operands);
    const arrow = negative ? format.past.pattern : format.future.pattern;
    const raw = arrow(bundle, plural);
    return this.wrapper.format(raw, [n.toString()]);
  }

}

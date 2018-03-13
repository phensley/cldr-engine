import { Bundle, DateFieldType } from '@phensley/cldr-schema';
import { DateFieldsInternal } from './internal';
import { RelativeTimeFormatOptions } from './options';
import { DecimalArg, ZonedDateTime } from '../../types';

const defaultOptions: RelativeTimeFormatOptions = { width: 'wide' };

export class DateFieldsEngine {

  constructor(
    protected internal: DateFieldsInternal,
    protected bundle: Bundle
  ) { }

  formatRelativeTime(
    value: DecimalArg, field: DateFieldType, options: RelativeTimeFormatOptions = defaultOptions): string {
    return this.internal.formatRelativeTime(this.bundle, value, field, options);
  }

}

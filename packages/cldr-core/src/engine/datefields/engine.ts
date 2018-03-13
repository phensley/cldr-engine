import { Bundle, DateFieldType, RelativeTimeWidth } from '@phensley/cldr-schema';
import { DateFieldsInternal } from './internal';
import { DecimalArg, ZonedDateTime } from '../../types';

export class DateFieldsEngine {

  constructor(
    protected internal: DateFieldsInternal,
    protected bundle: Bundle
  ) { }

  formatRelativeTime(value: DecimalArg, field: DateFieldType, width: RelativeTimeWidth = 'wide'): string {
    return this.internal.formatRelativeTime(this.bundle, value, field, width);
  }

}

import { field, scope, vector1, vector2, Scope } from '../types';

import {
  PersianAvailableFormatIndex,
  PersianEraIndex,
  PersianIntervalFormatIndex,
  PersianMonthIndex
} from '../schema';

const formats = (name: string, rename: string) => scope(name, rename, [
  vector2('weekdays', 'field-width', 'weekday'),
  vector2('months', 'field-width', 'persian-month'),
  vector2('quarters', 'field-width', 'quarter'),
  vector2('dayPeriods', 'field-width', 'day-period'),
]);

export const PERSIAN: Scope = scope('Persian', 'Persian', [
  vector2('eras', 'era-type', 'persian-era'),
  formats('format', 'format'),
  formats('standAlone', 'standAlone'),
  vector2('availableFormats', 'plural-key', 'persian-available-format'),
  vector2('intervalFormats', 'date-time-pattern-field', 'persian-interval-format'),
  vector1('dateFormats', 'format-width'),
  vector1('timeFormats', 'format-width'),
  vector1('dateTimeFormats', 'format-width'),
  field('intervalFormatFallback')
]);

export const PERSIAN_INDICES = {
  'persian-available-format': PersianAvailableFormatIndex,
  'persian-era': PersianEraIndex,
  'persian-interval-format': PersianIntervalFormatIndex,
  'persian-month': PersianMonthIndex
};

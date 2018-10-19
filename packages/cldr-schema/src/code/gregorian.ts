import { field, scope, vector1, vector2, KeyIndex, Scope } from '../types';

import {
  DateTimePatternFieldValues,
  DayPeriodValues,
  FieldWidthValues,
  FormatWidthValues,
  GregorianAvailableFormatIndex,
  GregorianEraIndex,
  GregorianIntervalFormatIndex,
  GregorianMonthsIndex,
  PluralIndex,
  QuarterValues,
  WeekdayValues,
} from '../schema';

import {
  DateTimePatternFieldIndex,
  DayPeriodIndex,
  EraTypeIndex,
  FieldWidthIndex,
  FormatWidthIndex,
  QuartersIndex,
  WeekdaysIndex
} from './calendars';

const formats = (name: string, rename: string) => scope(name, rename, [
  vector2('weekdays', 'field-width', 'weekday'),
  vector2('months', 'field-width', 'gregorian-month'),
  vector2('quarters', 'field-width', 'quarter'),
  vector2('dayPeriods', 'field-width', 'day-period'),
]);

export const GREGORIAN: Scope = scope('Gregorian', 'Gregorian', [
  vector2('eras', 'era-type', 'gregorian-era'),
  formats('format', 'format'),
  formats('standAlone', 'standAlone'),
  vector2('availableFormats', 'plural-key', 'gregorian-available-format'),
  vector2('intervalFormats', 'date-time-pattern-field', 'gregorian-interval-format'),
  vector1('dateFormats', 'format-width'),
  vector1('timeFormats', 'format-width'),
  vector1('dateTimeFormats', 'format-width'),
  field('intervalFormatFallback')
]);

export const GREGORIAN_INDICES = {
  'gregorian-available-format': GregorianAvailableFormatIndex,
  'gregorian-era': GregorianEraIndex,
  'gregorian-interval-format': GregorianIntervalFormatIndex,
  'gregorian-month': GregorianMonthsIndex
};

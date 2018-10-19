import { field, scope, vector1, vector2, KeyIndex, Scope } from '../types';

import {
  DateTimePatternFieldValues,
  DayPeriodValues,
  FieldWidthValues,
  FormatWidthValues,
  JapaneseAvailableFormatIndex,
  JapaneseEraIndex,
  JapaneseIntervalFormatIndex,
  JapaneseMonthsIndex,
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
  vector2('months', 'field-width', 'japanese-month'),
  vector2('quarters', 'field-width', 'quarter'),
  vector2('dayPeriods', 'field-width', 'day-period'),
]);

export const JAPANESE: Scope = scope('Japanese', 'Japanese', [
  vector2('eras', 'era-type', 'japanese-era'),
  formats('format', 'format'),
  formats('standAlone', 'standAlone'),
  vector2('availableFormats', 'plural-key', 'japanese-available-format'),
  vector2('intervalFormats', 'date-time-pattern-field', 'japanese-interval-format'),
  vector1('dateFormats', 'format-width'),
  vector1('timeFormats', 'format-width'),
  vector1('dateTimeFormats', 'format-width'),
  field('intervalFormatFallback')
]);

export const JAPANESE_INDICES = {
  'japanese-available-format': JapaneseAvailableFormatIndex,
  'japanese-era': JapaneseEraIndex,
  'japanese-interval-format': JapaneseIntervalFormatIndex,
  'japanese-month': JapaneseMonthsIndex
};

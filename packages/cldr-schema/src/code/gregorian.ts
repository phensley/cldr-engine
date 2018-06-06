import { field, scope, vector1, vector2, KeyIndex, Scope } from '../types';

import {
  DateTimePatternFieldValues,
  DayPeriodValues,
  FieldWidthValues,
  FormatWidthValues,
  GregorianInfo,
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

const AvailableFormatIndex = new KeyIndex(GregorianInfo.availableFormats);
const EraIndex = new KeyIndex(GregorianInfo.eras);
const IntervalFormatIndex = new KeyIndex(GregorianInfo.intervalFormats);
const MonthsIndex = new KeyIndex(GregorianInfo.months);

const formats = (name: string, rename: string) => scope(name, rename, [
  vector2('weekdays', FieldWidthIndex, WeekdaysIndex),
  vector2('months', FieldWidthIndex, MonthsIndex),
  vector2('quarters', FieldWidthIndex, QuartersIndex),
  vector2('dayPeriods', FieldWidthIndex, DayPeriodIndex),
]);

export const GREGORIAN: Scope = scope('Gregorian', 'Gregorian', [
  vector2('eras', EraTypeIndex, EraIndex),
  formats('format', 'format'),
  formats('standAlone', 'standAlone'),
  vector2('availableFormats', PluralIndex, AvailableFormatIndex),
  vector2('intervalFormats', DateTimePatternFieldIndex, IntervalFormatIndex),
  vector1('dateFormats', FormatWidthIndex),
  vector1('timeFormats', FormatWidthIndex),
  vector1('dateTimeFormats', FormatWidthIndex),
  field('intervalFormatFallback')
]);

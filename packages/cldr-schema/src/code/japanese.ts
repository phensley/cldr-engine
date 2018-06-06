import { field, scope, vector1, vector2, KeyIndex, Scope } from '../types';

import {
  DateTimePatternFieldValues,
  DayPeriodValues,
  FieldWidthValues,
  FormatWidthValues,
  JapaneseInfo,
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

const AvailableFormatIndex = new KeyIndex(JapaneseInfo.availableFormats);
const EraIndex = new KeyIndex(JapaneseInfo.eras);
const IntervalFormatIndex = new KeyIndex(JapaneseInfo.intervalFormats);
const MonthsIndex = new KeyIndex(JapaneseInfo.months);

const formats = (name: string, rename: string) => scope(name, rename, [
  vector2('weekdays', FieldWidthIndex, WeekdaysIndex),
  vector2('months', FieldWidthIndex, MonthsIndex),
  vector2('quarters', FieldWidthIndex, QuartersIndex),
  vector2('dayPeriods', FieldWidthIndex, DayPeriodIndex),
]);

export const JAPANESE: Scope = scope('Japanese', 'Japanese', [
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

import { KeyIndex, Scope, field, scope, vector1, vector2 } from '../types';

import {
  BuddhistInfo,
  DateTimePatternFieldValues,
  DayPeriodValues,
  FieldWidthValues,
  FormatWidthValues,
  PluralIndex,
  QuarterValues,
  WeekdayValues,
} from '../schema';

import {
  DateTimePatternFieldIndex,
  DayPeriodIndex,
  EraTypeIndex,
  FormatWidthIndex,
  QuartersIndex,
  WeekdaysIndex,
  FieldWidthIndex
} from './calendars';

const AvailableFormatIndex = new KeyIndex(BuddhistInfo.availableFormats);
const EraIndex = new KeyIndex(BuddhistInfo.eras);
const IntervalFormatIndex = new KeyIndex(BuddhistInfo.intervalFormats);
const MonthsIndex = new KeyIndex(BuddhistInfo.months);

const formats = (name: string, rename: string) => scope(name, rename, [
  vector2('weekdays', FieldWidthIndex, WeekdaysIndex),
  vector2('months', FieldWidthIndex, MonthsIndex),
  vector2('quarters', FieldWidthIndex, QuartersIndex),
  vector2('dayPeriods', FieldWidthIndex, DayPeriodIndex),
]);

export const BUDDHIST: Scope = scope('Buddhist', 'Buddhist', [
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

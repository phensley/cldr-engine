import { KeyIndex, Scope, field, scope, vector1, vector2 } from '../types';

import {
  DateTimePatternFieldValues,
  DayPeriodValues,
  FieldWidthValues,
  FormatWidthValues,
  PersianInfo,
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

const AvailableFormatIndex = new KeyIndex(PersianInfo.availableFormats);
const EraIndex = new KeyIndex(PersianInfo.eras);
const IntervalFormatIndex = new KeyIndex(PersianInfo.intervalFormats);
const MonthsIndex = new KeyIndex(PersianInfo.months);

const formats = (name: string, rename: string) => scope(name, rename, [
  vector2('weekdays', FieldWidthIndex, WeekdaysIndex),
  vector2('months', FieldWidthIndex, MonthsIndex),
  vector2('quarters', FieldWidthIndex, QuartersIndex),
  vector2('dayPeriods', FieldWidthIndex, DayPeriodIndex),
]);

export const PERSIAN: Scope = scope('Persian', 'Persian', [
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

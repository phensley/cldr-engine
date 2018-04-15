import { Choice, Scope, FieldMap, field, fieldmap, scope, scopefield, scopemap,
  KeyIndex, vector1, vector2 } from '../types';

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

const DateTimePatternFieldIndex = new KeyIndex(DateTimePatternFieldValues);
const AvailableFormatIndex = new KeyIndex(GregorianInfo.availableFormats);
const IntervalFormatIndex = new KeyIndex(GregorianInfo.intervalFormats);
const FormatWidthIndex = new KeyIndex(FormatWidthValues);

const EraTypeIndex = new KeyIndex(['names', 'abbr', 'narrow']);
const WidthIndex = new KeyIndex(['short', 'wide', 'narrow', 'abbreviated']);

const DayPeriodIndex = new KeyIndex(DayPeriodValues);
const EraIndex = new KeyIndex(GregorianInfo.eras);
const MonthsIndex = new KeyIndex(GregorianInfo.months);
const QuartersIndex = new KeyIndex(QuarterValues);
const WeekdaysIndex = new KeyIndex(WeekdayValues);

const formats = (name: string, rename: string) => scope(name, rename, [
  vector2('weekdays', WidthIndex, WeekdaysIndex),
  vector2('months', WidthIndex, MonthsIndex),
  vector2('quarters', WidthIndex, QuartersIndex),
  vector2('dayPeriods', WidthIndex, DayPeriodIndex),
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
  field('intervalFormatFallback', 'intervalFormatFallback')
]);

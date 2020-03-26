import { KeyIndexMap } from '@phensley/cldr-types';
import { field, scope, vector, KeyIndexImpl } from '../instructions';

import {
  BuddhistEraIndex,
  DateTimePatternFieldValues,
  DayPeriodValues,
  EraWidthValues,
  FieldWidthValues,
  FormatWidthValues,
  GregorianEraIndex,
  GregorianMonthsIndex,
  JapaneseEraIndex,
  PersianEraIndex,
  QuarterValues,
  WeekdayValues,
} from '../schema';

const formats = (name: string, rename: string, month: string) => scope(name, rename, [
  vector('weekdays', ['field-width', 'weekday']),
  vector('months', ['field-width', `${month}-month`]),
  vector('quarters', ['field-width', 'quarter']),
  vector('dayPeriods', ['field-width', 'day-period']),
]);

const calendarScope = (name: string, scopeName: string) => scope(scopeName, scopeName, [
  vector('eras', ['era-type', `${name}-era`]),
  formats('format', 'format', name),
  formats('standAlone', 'standAlone', name),
  vector('availableFormats', [`${name}-available-format`]),
  vector('pluralFormats', ['plural-key', `${name}-plural-format`]),
  vector('intervalFormats', ['date-time-pattern-field', `${name}-interval-format`]),
  vector('dateFormats', ['format-width']),
  vector('timeFormats', ['format-width']),
  vector('dateTimeFormats', ['format-width']),
  field('intervalFormatFallback')
]);

export const DateTimePatternFieldIndex = new KeyIndexImpl(DateTimePatternFieldValues);
export const DayPeriodIndex = new KeyIndexImpl(DayPeriodValues);
export const EraTypeIndex = new KeyIndexImpl(EraWidthValues);
export const FieldWidthIndex = new KeyIndexImpl(FieldWidthValues);
export const FormatWidthIndex = new KeyIndexImpl(FormatWidthValues);
export const QuartersIndex = new KeyIndexImpl(QuarterValues);
export const WeekdaysIndex = new KeyIndexImpl(WeekdayValues);

export const CALENDAR_INDICES: KeyIndexMap = {
  'date-time-pattern-field': DateTimePatternFieldIndex,
  'day-period': DayPeriodIndex,
  'era-type': EraTypeIndex,
  'field-width': FieldWidthIndex,
  'format-width': FormatWidthIndex,
  'quarter': QuartersIndex,
  'weekday': WeekdaysIndex
};

export const BUDDHIST = calendarScope('buddhist', 'Buddhist');

export const BUDDHIST_INDICES: KeyIndexMap = {
  'buddhist-era': BuddhistEraIndex,
  'buddhist-month': GregorianMonthsIndex
};

export const GREGORIAN = calendarScope('gregorian', 'Gregorian');

export const GREGORIAN_INDICES: KeyIndexMap = {
  'gregorian-era': GregorianEraIndex,
  'gregorian-month': GregorianMonthsIndex
};

export const JAPANESE = calendarScope('japanese', 'Japanese');

export const JAPANESE_INDICES: KeyIndexMap = {
  'japanese-era': JapaneseEraIndex,
  'japanese-month': GregorianMonthsIndex
};

export const PERSIAN = calendarScope('persian', 'Persian');

export const PERSIAN_INDICES: KeyIndexMap = {
  'persian-era': PersianEraIndex,
  'persian-month': GregorianMonthsIndex
};

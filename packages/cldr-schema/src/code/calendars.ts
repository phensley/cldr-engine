import { KeyIndex, KeyIndexMap } from '../types';
import { calendarScope } from './common';
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

export const DateTimePatternFieldIndex = new KeyIndex(DateTimePatternFieldValues);
export const DayPeriodIndex = new KeyIndex(DayPeriodValues);
export const EraTypeIndex = new KeyIndex(EraWidthValues);
export const FieldWidthIndex = new KeyIndex(FieldWidthValues);
export const FormatWidthIndex = new KeyIndex(FormatWidthValues);
export const QuartersIndex = new KeyIndex(QuarterValues);
export const WeekdaysIndex = new KeyIndex(WeekdayValues);

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

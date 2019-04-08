import { KeyIndex, KeyIndexMap } from '../types';

import {
  DateTimePatternFieldValues,
  DayPeriodValues,
  EraWidthValues,
  FieldWidthValues,
  FormatWidthValues,
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

export const CALENDAR_VALUES = {
  'date-time-pattern-field': DateTimePatternFieldValues,
  'day-period': DayPeriodValues,
  'era-width': EraWidthValues,
  'field-width': FieldWidthValues,
  'format-width': FormatWidthValues,
  'quarter': QuarterValues,
  'weekday': WeekdayValues
};
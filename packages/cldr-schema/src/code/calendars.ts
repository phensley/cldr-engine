import { Instruction, KeyIndex } from '../types';

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

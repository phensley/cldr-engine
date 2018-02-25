import { makeKeyedEnum } from '../../types';

// Enums common to all calendars

// Values 'h' and 'H' for hours have been unified to 'H' for uniqueness.
export const [ DateTimeField, DateTimeFieldValues ] = makeKeyedEnum([
  ['YEAR', 'y'],
  ['MONTH', 'M'],
  ['DAY', 'd'],
  ['AM_PM', 'a'],
  ['HOUR', 'H'],
  ['MINUTE', 'm'],
  ['SECOND', 's']
]);

export type DateTimeFieldType = 'y' | 'M' | 'd' | 'a' | 'H' | 'm' | 's';

export const [ DayPeriod, DayPeriodValues ] = makeKeyedEnum([
  ['NOON', 'noon'],
  ['MIDNIGHT', 'midnight'],
  ['AM', 'am'],
  ['PM', 'pm'],
  ['MORNING1', 'morning1'],
  ['MORNING2', 'morning2'],
  ['AFTERNOON1', 'afternoon1'],
  ['AFTERNOON2', 'afternoon2'],
  ['EVENING1', 'evening1'],
  ['EVENING2', 'evening2'],
  ['NIGHT1', 'night1'],
  ['NIGHT2', 'night2']
]);

export type DayPeriodType = 'noon' | 'midnight' | 'am' | 'pm' | 'morning1' | 'morning2' |
  'afternoon1' | 'afternoon2' | 'evening1' | 'evening2' | 'night1' | 'night2';

export const [ FieldWidth, FieldWidthValues ] = makeKeyedEnum([
  ['ABBREVIATED', 'abbreviated'],
  ['NARROW', 'narrow'],
  ['SHORT', 'short'],
  ['WIDE', 'wide']
]);

export type FieldWidthType = 'abbreviated' | 'narrow' | 'short' | 'wide';

export const [ FormatWidth, FormatWidthValues ] = makeKeyedEnum([
  ['SHORT', 'short'],
  ['MEDIUM', 'medium'],
  ['LONG', 'long'],
  ['FULL', 'full']
]);

export type FormatWidthType = 'short' | 'medium' | 'long' | 'full';

export const [ Quarter, QuarterValues ] = makeKeyedEnum([
  ['Q1', '1'],
  ['Q2', '2'],
  ['Q3', '3'],
  ['Q4', '4']
]);

export type QuarterType = '1' | '2' | '3' | '4';

export const [ Weekday, WeekdayValues ] = makeKeyedEnum([
  ['SUN', 'sun'],
  ['MON', 'mon'],
  ['TUE', 'tue'],
  ['WED', 'wed'],
  ['THU', 'thu'],
  ['FRI', 'fri'],
  ['SAT', 'sat']
]);

export type WeekdayType = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

import { makeKeyedEnum } from '../../types';

// Values 'h' and 'H' for hours have been unified to 'H' for uniqueness.
export type DateTimePatternFieldType = 'y' | 'M' | 'd' | 'a' | 'H' | 'm' | 's';

export const [ DateTimePatternField, DateTimePatternFieldValues ] = makeKeyedEnum<string, DateTimePatternFieldType>([
  ['YEAR', 'y'],
  ['MONTH', 'M'],
  ['DAY', 'd'],
  ['DAYPERIOD', 'a'],
  ['HOUR', 'H'],
  ['MINUTE', 'm'],
  ['SECOND', 's']
]);

export type DayPeriodType = 'noon' | 'midnight' | 'am' | 'pm' | 'morning1' | 'morning2' |
  'afternoon1' | 'afternoon2' | 'evening1' | 'evening2' | 'night1' | 'night2';

export const [ DayPeriod, DayPeriodValues ] = makeKeyedEnum<string, DayPeriodType>([
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

export type EraWidthType = 'names' | 'abbr' | 'narrow';

export const [ EraWidth, EraWidthValues ] = makeKeyedEnum<string, EraWidthType>([
  ['NAMES', 'names'],
  ['ABBR', 'abbr'],
  ['NARROW', 'narrow']
]);

export type FieldWidthType = 'abbreviated' | 'narrow' | 'short' | 'wide';

export const [ FieldWidth, FieldWidthValues ] = makeKeyedEnum<string, FieldWidthType>([
  ['ABBREVIATED', 'abbreviated'],
  ['NARROW', 'narrow'],
  ['SHORT', 'short'],
  ['WIDE', 'wide']
]);

export type FormatWidthType = 'short' | 'medium' | 'long' | 'full';

export const [ FormatWidth, FormatWidthValues ] = makeKeyedEnum<string, FormatWidthType>([
  ['SHORT', 'short'],
  ['MEDIUM', 'medium'],
  ['LONG', 'long'],
  ['FULL', 'full']
]);

export type QuarterType = '1' | '2' | '3' | '4';

export const [ Quarter, QuarterValues ] = makeKeyedEnum<string, QuarterType>([
  ['Q1', '1'],
  ['Q2', '2'],
  ['Q3', '3'],
  ['Q4', '4']
]);

export type WeekdayType = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const [ Weekday, WeekdayValues ] = makeKeyedEnum<string, WeekdayType>([
  ['SUN', 'sun'],
  ['MON', 'mon'],
  ['TUE', 'tue'],
  ['WED', 'wed'],
  ['THU', 'thu'],
  ['FRI', 'fri'],
  ['SAT', 'sat']
]);

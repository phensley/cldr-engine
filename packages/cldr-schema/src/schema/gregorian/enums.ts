import { makeEnum, makeKeyedEnum } from '../../types';

export const [ Era, EraValues ] = makeKeyedEnum([
  ['BC', '0'],
  ['AD', '1']
]);

export type EraType = '0' | '1';

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

export const [ Month, MonthValues ] = makeKeyedEnum([
  ['JAN', '1'],
  ['FEB', '2'],
  ['MAR', '3'],
  ['APR', '4'],
  ['MAY', '5'],
  ['JUN', '6'],
  ['JUL', '7'],
  ['AUG', '8'],
  ['SEP', '9'],
  ['OCT', '10'],
  ['NOV', '11'],
  ['DEC', '12']
]);

export type MonthType = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export const [ Quarter, QuarterValues ] = makeKeyedEnum([
  ['Q1', '1'],
  ['Q2', '2'],
  ['Q3', '3'],
  ['Q4', '4']
]);

export type QuarterType = '1' | '2' | '3' | '4';

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

export const [ AvailableFormat, AvailableFormatValues ] = makeEnum([
  'Bh',
  'Bhm',
  'Bhms',
  'E',
  'EBhm',
  'EBhms',
  'EHm',
  'EHms',
  'Ed',
  'Ehm',
  'Ehms',
  'Gy',
  'GyMMM',
  'GyMMMEd',
  'GyMMMd',
  'H',
  'Hm',
  'Hms',
  'Hmsv',
  'Hmv',
  'M',
  'MEd',
  'MMM',
  'MMMEd',
  'MMMMEd',
  'MMMMd',
  'MMMd',
  'Md',
  'd',
  'h',
  'hm',
  'hms',
  'hmsv',
  'hmv',
  'ms',
  'y',
  'yM',
  'yMEd',
  'yMMM',
  'yMMMEd',
  'yMMMM',
  'yMMMd',
  'yMd',
  'yQQQ',
  'yQQQQ'
]);

export type AvailableFormatType = 'Bh' | 'Bhm' | 'Bhms' | 'E' | 'EBhm' | 'EBhms' | 'EHm' |
  'EHms' | 'Ed' | 'Ehm' | 'Ehms' | 'Gy' | 'GyMMM' | 'GyMMMEd' | 'GyMMMd' | 'H' | 'Hm' |
  'Hms' | 'Hmsv' | 'Hmv' | 'M' | 'MEd' | 'MMM' | 'MMMEd' | 'MMMMEd' | 'MMMMd' | 'MMMd' |
  'Md' | 'd' | 'h' | 'hm' | 'hms' | 'hmsv' | 'hmv' | 'ms' | 'y' | 'yM' | 'yMEd' | 'yMMM' |
  'yMMMEd' | 'yMMMM' | 'yMMMd' | 'yMd' | 'yQQQ' | 'yQQQQ';

export const [ IntervalFormat, IntervalFormatValues ] = makeEnum([
  'H',
  'Hm',
  'Hmv',
  'Hv',
  'M',
  'MEd',
  'MMM',
  'MMMEd',
  'MMMd',
  'Md',
  'd',
  'h',
  'hm',
  'hmv',
  'hv',
  'y',
  'yM',
  'yMEd',
  'yMMM',
  'yMMMEd',
  'yMMMM',
  'yMMMd',
  'yMd'
]);

export type IntervalFormatType = 'H' | 'Hm' | 'Hmv' | 'Hv' | 'M' | 'MEd' | 'MMM' |
  'MMMEd' | 'MMMd' | 'Md' | 'd' | 'h' | 'hm' | 'hmv' | 'hv' | 'y' | 'yM' | 'yMEd' |
  'yMMM' | 'yMMMEd' | 'yMMMM' | 'yMMMd' | 'yMd';

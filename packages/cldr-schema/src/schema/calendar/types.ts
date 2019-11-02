import { PluralType } from '@phensley/cldr-types';
import { FieldArrow, Vector1Arrow, Vector2Arrow } from '../arrows';

// Values 'h' and 'H' for hours have been unified to 'H' for uniqueness.
export type DateTimePatternFieldType = 'y' | 'M' | 'd' | 'a' | 'H' | 'm' | 's';

export const DateTimePatternFieldValues: DateTimePatternFieldType[] = [
  'y', 'M', 'd', 'a', 'H', 'm', 's'
];

export type DayPeriodType = 'noon' | 'midnight' | 'am' | 'pm' | 'morning1' | 'morning2' |
  'afternoon1' | 'afternoon2' | 'evening1' | 'evening2' | 'night1' | 'night2';

export const DayPeriodValues: DayPeriodType[] = [
  'noon', 'midnight', 'am', 'pm', 'morning1', 'morning2',
  'afternoon1', 'afternoon2', 'evening1', 'evening2', 'night1', 'night2',
];

export const enum DayPeriod {
  NOON = 'noon',
  MIDNIGHT = 'midnight',
  AM = 'am',
  PM = 'pm',
  MORNING1 = 'morning1',
  MORNING2 = 'morning2',
  AFTERNOON1 = 'afternoon1',
  AFTERNOON2 = 'afternoon2',
  EVENING1 = 'evening1',
  EVENING2 = 'evening2',
  NIGHT1 = 'night1',
  NIGHT2 = 'night2'
}

export type EraWidthType = 'names' | 'abbr' | 'narrow';

export const EraWidthValues: EraWidthType[] = [
  'names', 'abbr', 'narrow'
];

export const enum EraWidth {
  NAMES = 'names',
  ABBR = 'abbr',
  NARROW = 'narrow'
}

export type FieldWidthType = 'abbreviated' | 'narrow' | 'short' | 'wide';

export const FieldWidthValues: FieldWidthType[] = [
  'abbreviated', 'narrow', 'short', 'wide'
];

export const enum FieldWidth {
  ABBREVIATED = 'abbreviated',
  NARROW = 'narrow',
  SHORT = 'short',
  WIDE = 'wide'
}

export type FormatWidthType = 'short' | 'medium' | 'long' | 'full';

export const FormatWidthValues: FormatWidthType[] = [
  'short', 'medium', 'long', 'full'
];

export const enum FormatWidth {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
  FULL = 'full'
}

export type QuarterType = '1' | '2' | '3' | '4';

export const QuarterValues: QuarterType[] = [
  '1', '2', '3', '4'
];

export const enum Quarter {
  FIRST = '1',
  SECOND = '2',
  THIRD = '3',
  FOURTH = '4'
}

export type WeekdayType = '1' | '2' | '3' | '4' | '5' | '6' | '7';

export const WeekdayValues: WeekdayType[] = [
  '1', '2', '3', '4', '5', '6', '7'
];

export const enum Weekday {
  SUNDAY = '1',
  MONDAY = '2',
  TUESDAY = '3',
  WEDNESDAY = '4',
  THURSDAY = '5',
  FRIDAY = '6',
  SATURDAY = '7'
}

export interface CalendarFields {
  readonly weekdays: Vector2Arrow<string, string>;
  readonly months: Vector2Arrow<string, string>;
  readonly quarters: Vector2Arrow<string, string>;
  readonly dayPeriods: Vector2Arrow<string, string>;
}

export interface CalendarSchema {
  readonly eras: Vector2Arrow<EraWidthType, string>;
  readonly format: CalendarFields;
  readonly standAlone: CalendarFields;
  readonly availableFormats: Vector1Arrow<string>;
  readonly pluralFormats: Vector2Arrow<PluralType, string>;
  readonly intervalFormats: Vector2Arrow<DateTimePatternFieldType, string>;
  readonly dateFormats: Vector1Arrow<FormatWidthType>;
  readonly timeFormats: Vector1Arrow<FormatWidthType>;
  readonly dateTimeFormats: Vector1Arrow<FormatWidthType>;
  readonly intervalFormatFallback: FieldArrow;
}

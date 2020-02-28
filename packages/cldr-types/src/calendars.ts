/**
 * Values 'h' and 'H' for hours have been unified to 'H' for uniqueness
 *
 * @public
 */
export type DateTimePatternFieldType = 'y' | 'M' | 'd' | 'a' | 'H' | 'm' | 's';

/**
 * @public
 */
export const enum DateTimePatternField {
  YEAR = 'y',
  MONTH = 'M',
  DAY = 'd',
  DAYPERIOD = 'a', // am / pm
  HOUR = 'H',
  MINUTE = 'm',
  SECOND = 's'
}

/**
 * @public
 */
export type DayPeriodType = 'noon' | 'midnight' | 'am' | 'pm' | 'morning1' | 'morning2' |
  'afternoon1' | 'afternoon2' | 'evening1' | 'evening2' | 'night1' | 'night2';

/**
 * @public
 */
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

/**
 * @public
 */
export type EraWidthType = 'names' | 'abbr' | 'narrow';

/**
 * @public
 */
export const enum EraWidth {
  NAMES = 'names',
  ABBR = 'abbr',
  NARROW = 'narrow'
}

/**
 * @public
 */
export type FieldWidthType = 'abbreviated' | 'narrow' | 'short' | 'wide';

/**
 * @public
 */
export const enum FieldWidth {
  ABBREVIATED = 'abbreviated',
  NARROW = 'narrow',
  SHORT = 'short',
  WIDE = 'wide'
}

/**
 * @public
 */
export type FormatWidthType = 'short' | 'medium' | 'long' | 'full';

/**
 * @public
 */
export const enum FormatWidth {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
  FULL = 'full'
}

/**
 * @public
 */
export type QuarterType = '1' | '2' | '3' | '4';

/**
 * @public
 */
export const enum Quarter {
  FIRST = '1',
  SECOND = '2',
  THIRD = '3',
  FOURTH = '4'
}

/**
 * @public
 */
export type WeekdayType = '1' | '2' | '3' | '4' | '5' | '6' | '7';

/**
 * @public
 */
export const enum Weekday {
  SUNDAY = '1',
  MONDAY = '2',
  TUESDAY = '3',
  WEDNESDAY = '4',
  THURSDAY = '5',
  FRIDAY = '6',
  SATURDAY = '7'
}

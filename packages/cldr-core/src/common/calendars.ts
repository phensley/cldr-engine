import {
  ContextType,
  DateFieldWidthType,
  DayPeriodAltType,
  EraAltType,
  EraWidthType,
  FieldWidthType,
  FormatWidthType,
} from '@phensley/cldr-types';

import { TimePeriodField } from '../systems';
import { CalendarType } from '../systems/calendars/types';
import { NumberFormatOptions, NumberSystemType } from './numbers';

/**
 * @public
 */
export interface ZonedDateTime {
  /**
   * Can be either a Date object or Unix epoch time in milliseconds.
   * Both are interpreted as being relative to UTC.
   */
  date: number | Date;

  /**
   * Optional timezone identifier, defaulting to UTC.
   */
  zoneId?: string;
}

/**
 * @public
 */
export interface CalendarFieldsOptions {
  /**
   * Overrides which calendar to use
   */
  ca?: CalendarType;

  /**
   * Width of the fields.
   */
  width?: FieldWidthType;

  /**
   * Context in which the fields will be used
   */
  context?: ContextType;
}

/**
 * @public
 */
export interface EraFieldOptions {
  /**
   * Overrides which calendar to use
   */
  ca?: CalendarType;

  /**
   * Width of the fields.
   */
  width?: EraWidthType;

  /**
   * Context in which the fields will be displayed
   */
  context?: ContextType;
}

/**
 * @public
 */
export interface DateFieldFormatOptions {
  /**
   * Overrides which calendar to use
   */
  ca?: CalendarType;

  /**
   * Width of the field.
   */
  width?: DateFieldWidthType;

  /**
   * Context in which field will be displayed
   */
  context?: ContextType;
}

/**
 * @public
 */
export interface DateFormatAltOptions {
  era?: EraAltType;
  dayPeriod?: DayPeriodAltType;
}

/**
 * @public
 */
export interface DateFormatOptions {
  /**
   * Set format for both date and time.
   */
  datetime?: FormatWidthType;

  /**
   * Date format.
   */
  date?: FormatWidthType;

  /**
   * Time format.
   */
  time?: FormatWidthType;

  /**
   * Wrapper format to use, if both a date and time are being formatted.
   */
  wrap?: FormatWidthType;

  /**
   * A skeleton format containing date and/or time fields.
   */
  skeleton?: string;

  /**
   * Specify the calendar to use.
   */
  ca?: CalendarType;

  /**
   * Specify the number system to use.
   */
  nu?: NumberSystemType;

  /**
   * Context in which the formatted string will be used
   */
  context?: ContextType;

  /**
   * Selection of alternate fields.
   */
  alt?: DateFormatAltOptions;

  /**
   * Wrap with 'at' if available. This defaults to true since it was
   * the default datetime wrapper format in CLDR releases prior to v42.
   */
  atTime?: boolean;
}

/**
 * @public
 */
export interface DateRawFormatOptions {
  /**
   * Raw date time pattern to use.
   */
  pattern?: string;

  /**
   * Specify the calendar to use.
   */
  ca?: CalendarType;

  /**
   * Specify the numbering system to use.
   */
  nu?: NumberSystemType;

  /**
   * Context in which the formatted string will be used
   */
  context?: ContextType;

  /**
   * Selection of alternate fields.
   */
  alt?: DateFormatAltOptions;
}

/**
 * @public
 */
export interface DateIntervalFormatOptions {
  /**
   * Enable strict mode. This will avoid adding any context to the user's
   * choices.
   *
   * Certain cases can be ambiguous, where two dates:
   *   start = 2025-02-15 12:30:00 PM
   *     end = 2025-02-20 13:30:00 PM
   *
   * Formatting with `jm` would produce "12:30 - 1:30 PM" leaving out the
   * fact that the two dates also differ by 5 days.
   * In non-strict mode the skeleton will be augmented with `yMMMd` to
   * provide important context.
   */
  strict?: boolean;

  /**
   * A skeleton format containing date and/or time fields. Note
   * that if present, this overrides the 'date' and 'time' options below.
   * If all are omitted a reasonable default will be selected.
   */
  skeleton?: string;

  /**
   * A skeleton containing fields to format if the difference
   * between the start and end dates is 1 day or more.
   */
  date?: string;

  /**
   * A skeleton containing fields to format if the difference
   * between the start and end dates is less than 1 day.
   */
  time?: string;

  /**
   * Specify the calendar to use
   */
  ca?: CalendarType;

  /**
   * Specify the number system to use
   */
  nu?: NumberSystemType;

  /**
   * Context in which the formatted string will be used
   */
  context?: ContextType;

  /**
   * Selection of alternate fields.
   */
  alt?: DateFormatAltOptions;

  /**
   * Wrapper format to use, if both a date and time are being formatted.
   */
  wrap?: FormatWidthType;

  /**
   * Wrap with 'at' if available. This defaults to true since it was
   * the default datetime wrapper format in CLDR releases prior to v42.
   */
  atTime?: boolean;
}

/**
 * Options used to format a relative time field.
 *
 * @public
 */
export interface RelativeTimeFieldFormatOptions extends NumberFormatOptions {
  /**
   * Specify the format width.
   */
  width?: DateFieldWidthType;

  /**
   * Context in which the formatted string will be used
   */
  context?: ContextType;

  /**
   * Force format to always display in terms of numbers
   */
  numericOnly?: boolean;

  /**
   * In numeric mode, if the value is exactly 0 display "now" instead of "in 0 seconds"
   */
  alwaysNow?: boolean;
}

/**
 * Options used to format a relative time.
 *
 * @public
 */
export interface RelativeTimeFormatOptions extends RelativeTimeFieldFormatOptions {
  /**
   * Specify the calendar to use.
   */
  ca?: CalendarType;

  /**
   * Include day-of-week formatting when applicable.
   */
  dayOfWeek?: boolean;

  /**
   * Allow weeks to be auto-selected.
   */
  allowWeeks?: boolean;

  /**
   * Specify which field the relative time should be expressed in.
   */
  field?: TimePeriodField;
}

/**
 * @public
 */
export interface DateWrapperFormatOptions {
  ca?: CalendarType;
  width?: FormatWidthType;

  /**
   * Wrap with 'at' if available. This defaults to true since it was
   * the default datetime wrapper format in CLDR releases prior to v42.
   */
  atTime?: boolean;
}

/**
 * @public
 */
export interface TimeData {
  /**
   * Preferred time cycle for the region.
   */
  preferred: string;

  /**
   * Allowed / acceptible time cycles for the region.
   */
  allowed: string[];
}

/**
 * @public
 */
export interface ExemplarCity {
  name: string;
}

/**
 * @public
 */
export interface MetazoneName {
  generic: string;
  standard: string;
  daylight: string;
}

/**
 * @public
 */
export interface MetazoneNames {
  long: MetazoneName;
  short: MetazoneName;
}

/**
 * @public
 */
export interface TimeZoneInfo {
  id: string;
  city: ExemplarCity;
  countries: string[];
  latitude: number;
  longitude: number;
  stdoffset: number;
  metazone: string;
  names: MetazoneNames;
}

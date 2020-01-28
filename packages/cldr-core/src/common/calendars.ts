import {
  ContextType,
  DateFieldWidthType,
  EraWidthType,
  FieldWidthType,
  FormatWidthType,
} from '@phensley/cldr-types';

import { NumberFormatOptions, NumberSystemType } from './numbers';
import { CalendarType } from '../systems/calendars/types';
import { TimePeriodField } from '../systems';

/**
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
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
}

/**
 * @alpha
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
}

/**
 * @alpha
 */
export interface DateIntervalFormatOptions {

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
}

/**
 * Options used to format a relative time field.
 *
 * @alpha
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
 * @alpha
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
   * Specify which field the relative time should be expressed in.
   */
  field?: TimePeriodField;
}

/**
 * @alpha
 */
export interface ExemplarCity {
  name: string;
}

/**
 * @alpha
 */
export interface TimeZoneInfo {
  id: string;
  city: ExemplarCity;
}

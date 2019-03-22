import { ContextType, FormatWidthType, RelativeTimeWidthType } from '@phensley/cldr-schema';
import { NumberSystemType } from './numbers';
import { CalendarType } from '../systems/calendars/calendar';

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
export interface DateFormatOptions {

  // Set format for both date and time.
  datetime?: FormatWidthType;

  // Date format.
  date?: FormatWidthType;

  // Time format.
  time?: FormatWidthType;

  // Wrapper format to use, if both a date and time are being formatted.
  wrap?: FormatWidthType;

  // A skeleton format containing date, time fields.
  skeleton?: string;

  // Specify the calendar to use.
  ca?: CalendarType;

  // Specify the number system to use.
  nu?: NumberSystemType;

  // Context in which the formatted string will be used
  context?: ContextType;

  // TODO: add context
  // readonly context: FormatContextType;
}

/**
 * @alpha
 */
export interface DateRawFormatOptions {

  readonly pattern?: string;

  ca?: CalendarType;

  nu?: NumberSystemType;

  // Context in which the formatted string will be used
  context?: ContextType;
}

/**
 * @alpha
 */
export interface DateIntervalFormatOptions {

  readonly skeleton: string;

  // Specify the calendar to use
  readonly ca?: CalendarType;

  // Specify the number system to use
  readonly nu?: NumberSystemType;

  // Context in which the formatted string will be used
  context?: ContextType;
}

/**
 * @alpha
 */
export interface RelativeTimeFormatOptions {
  width?: RelativeTimeWidthType;

  readonly nu?: NumberSystemType;

  // Context in which the formatted string will be used
  context?: ContextType;
}

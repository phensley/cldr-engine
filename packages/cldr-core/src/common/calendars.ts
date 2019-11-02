import {
  DateFieldWidthType,
  EraWidthType,
  FieldWidthType,
  FormatWidthType,
} from '@phensley/cldr-types';
import {
  ContextType,
} from '@phensley/cldr-schema';

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
export interface RelativeTimeFieldFormatOptions extends NumberFormatOptions {
  width?: DateFieldWidthType;

  readonly nu?: NumberSystemType;

  // Context in which the formatted string will be used
  context?: ContextType;

  // Force format to always display in terms of numbers
  numericOnly?: boolean;

  // In numeric mode, if the value is exactly 0 display "now" instead of "in 0 seconds"
  alwaysNow?: boolean;
}

export interface RelativeTimeFormatOptions extends NumberFormatOptions {
  width?: DateFieldWidthType;
  // Context in which the formatted string will be used
  context?: ContextType;
  ca?: CalendarType;
  dayOfWeek?: boolean;

  // Specify which field the relative time should be expressed in
  field?: TimePeriodField;

  // Force format to always display in terms of numbers
  numericOnly?: boolean;

  // In numeric mode, if the value is exactly 0 display "now" instead of "in 0 seconds"
  alwaysNow?: boolean;
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

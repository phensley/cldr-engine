import { FormatWidthType, RelativeTimeWidthType } from '@phensley/cldr-schema';
import { NumberSystemType } from './numbers';
import { CalendarType } from '../systems/calendars/calendar';

/**
 * @alpha
 */
export interface UnixEpochTime {
  epoch: number | Date;
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
}

/**
 * @alpha
 */
export interface RelativeTimeFormatOptions {
  width?: RelativeTimeWidthType;

  readonly nu?: NumberSystemType;
}

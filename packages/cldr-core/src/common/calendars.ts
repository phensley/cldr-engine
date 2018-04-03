import { FormatWidthType, RelativeTimeWidthType } from '@phensley/cldr-schema';
import { NumberSystemType } from './numbers';

/**
 * @alpha
 */
export interface DateFormatOptions {

  // Set format for both date and time.
  readonly datetime?: FormatWidthType;

  // Date format.
  readonly date?: FormatWidthType;

  // Time format.
  readonly time?: FormatWidthType;

  // Wrapper format to use, if both a date and time are being formatted.
  readonly wrap?: FormatWidthType;

  // A skeleton format containing date, time fields.
  readonly skeleton?: string;

  // Specify the calendar to use.
  readonly ca?: string;

  // Specify the number system to use.
  readonly nu?: NumberSystemType;

  // TODO: add context
  // readonly context: FormatContextType;
}

/**
 * @alpha
 */
export interface DateIntervalFormatOptions {

  readonly skeleton: string;

  // Specify the calendar to use
  readonly ca?: string;

  // Specify the number system to use
  readonly nu?: NumberSystemType;
}

/**
 * @alpha
 */
export interface RelativeTimeFormatOptions {
  width?: RelativeTimeWidthType;
}

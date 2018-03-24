import { FormatWidthType, RelativeTimeWidthType } from '@phensley/cldr-schema';

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

  // TODO: add context
  // readonly context: FormatContextType;
}

/**
 * @alpha
 */
export interface RelativeTimeFormatOptions {
  width?: RelativeTimeWidthType;
}

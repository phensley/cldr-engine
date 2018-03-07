import { FormatWidthType, AvailableFormatType } from '@phensley/cldr-schema';

export interface GregorianFormatOptions {

  // Combination date and time.
  readonly datetime?: FormatWidthType;

  // Date format. Named or skeleton.
  readonly date?: FormatWidthType | AvailableFormatType;

  // Time format. Named or skeleton.
  readonly time?: FormatWidthType | AvailableFormatType;

  // Wrapper format to use, if both a date and time are being formatted.
  readonly wrap?: FormatWidthType;

  // TODO: add context
  // readonly context: FormatContextType;
}

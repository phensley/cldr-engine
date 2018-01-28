export class GregorianFormatOptions {

  // Combination date and time.
  readonly datetime?: string;

  // Date format. Named or skeleton.
  readonly date?: string;

  // Time format. Named or skeleton.
  readonly time?: string;

  // Wrapper format to use, if both a date and time are being formatted.
  readonly wrap?: string;

}

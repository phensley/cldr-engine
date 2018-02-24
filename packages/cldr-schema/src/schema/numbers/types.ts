import { DigitsArrow, DivisorArrow, FieldArrow, FieldMapArrow, FieldIndexedArrow, ObjectArrow } from '../arrows';
import { Plural } from '../enums';

export interface CurrencySpacing {
  readonly currencyMatch: string;
  readonly surroundingMatch: string;
  readonly insertBetween: string;
}

export interface CurrencySpacingInfo {
  readonly beforeCurrency: ObjectArrow<CurrencySpacing>;
  readonly afterCurrency: ObjectArrow<CurrencySpacing>;
}

export interface CurrencyFormats {
  readonly accounting: FieldArrow;
  readonly short: CurrencyShortFormat;
  readonly standard: FieldArrow;
  readonly currencySpacing: CurrencySpacingInfo;
  readonly unitPattern: FieldIndexedArrow<Plural>;
}

export interface CurrencyShortFormat {
  readonly standard: DigitsArrow;
  readonly standardDivisor: DivisorArrow;
}

export interface DecimalPluralFormat {
  readonly decimalFormat: DigitsArrow;
  readonly decimalFormatDivisor: DivisorArrow;
}

export interface DecimalFormats {
  readonly long: DecimalPluralFormat;
  readonly short: DecimalPluralFormat;
  readonly standard: FieldArrow;
}

export interface PercentFormats {
  readonly standard: FieldArrow;
}

export interface NumberSymbols {
  readonly decimal: string;
  readonly exponential: string;
  readonly group: string;
  readonly infinity: string;
  readonly list: string;
  readonly minusSign: string;
  readonly nan: string;
  readonly perMille: string;
  readonly percentSign: string;
  readonly plusSign: string;
  readonly superscriptingExponent: string;
  readonly timeSeparator: string;
}

export interface Numbers {
  readonly currencyFormats: CurrencyFormats;
  readonly decimalFormats: DecimalFormats;
  readonly percentFormats: PercentFormats;
  readonly symbols: ObjectArrow<NumberSymbols>;
  readonly minimumGroupingDigits: FieldArrow;
}

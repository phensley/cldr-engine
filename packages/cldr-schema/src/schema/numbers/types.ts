import { DigitsArrow, FieldArrow, FieldMapArrow, FieldIndexedArrow } from '../arrows';
import { NumberSymbolType } from './enums';
import { Plural } from '../enums';

export interface CurrencyFormats {
  readonly accounting: FieldArrow;
  readonly short: CurrencyShortFormat;
  readonly standard: FieldArrow;
  readonly unitPattern: FieldIndexedArrow<Plural>;
}

export interface CurrencyShortFormat {
  readonly standard: DigitsArrow;
}

export interface DecimalPluralFormat {
  readonly decimalFormat: DigitsArrow;
}

export interface DecimalFormats {
  readonly long: DecimalPluralFormat;
  readonly short: DecimalPluralFormat;
  readonly standard: FieldArrow;
}

export interface PercentFormats {
  readonly standard: FieldArrow;
}

export interface Numbers {
  readonly currencyFormats: CurrencyFormats;
  readonly decimalFormats: DecimalFormats;
  readonly percentFormats: PercentFormats;
  readonly symbols: FieldMapArrow<NumberSymbolType>;
}

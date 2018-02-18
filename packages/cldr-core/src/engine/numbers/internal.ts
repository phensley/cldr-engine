import {
  Bundle, FieldMapArrow, Schema, ScopeArrow,
  CurrencyType, CurrencyInfo,
  CurrencyFormats, DecimalFormats,
  NumberSymbol, NumberSymbolType
} from '@phensley/cldr-schema';

import { Decimal, RoundingMode } from '../../types/numbers';
import { NumberFormatMode } from './options';
import { NumberPattern, parseNumberPattern } from '../../parsing/patterns/number';
import { Cache } from '../../utils/cache';

export class NumbersInternal {

  readonly Currencies: ScopeArrow<CurrencyType, CurrencyInfo>;
  readonly currencyFormats: CurrencyFormats;
  readonly decimalFormats: DecimalFormats;
  readonly symbols: FieldMapArrow<NumberSymbolType>;

  protected readonly numberPatternCache: Cache<NumberPattern[]>;

  constructor(readonly root: Schema, cacheSize: number = 50) {
    this.Currencies = root.Currencies;
    this.currencyFormats = root.Numbers.currencyFormats;
    this.decimalFormats = root.Numbers.decimalFormats;
    this.symbols = root.Numbers.symbols;
    this.numberPatternCache = new Cache(parseNumberPattern, cacheSize);
  }

  getNumberPattern(raw: string): NumberPattern[] {
    return this.numberPatternCache.get(raw);
  }
}

// TODO:

export const setup = (
  n: Decimal,
  round: RoundingMode,
  format: NumberFormatMode,
  minIntDigits: number,
  maxFracDigits: number,
  minFracDigits: number,
  maxSigDigits: number,
  minSigDigits: number
): Decimal => {

  const usesig = format === NumberFormatMode.SIGNIFICANT || format === NumberFormatMode.SIGNIFICANT_MAXFRAC;

  if (usesig && minSigDigits > 0 && maxSigDigits > 0) {
    if (n.precision() > maxSigDigits) {
      const scale = maxSigDigits - n.precision() + n.scale();
      // TODO:
    }

    if (format === NumberFormatMode.SIGNIFICANT_MAXFRAC && maxFracDigits < n.scale()) {
      // TODO:
    }

    // strip trailing zeros

  } else {
    const scale = Math.max(minFracDigits, Math.min(n.scale(), maxFracDigits));

  }

  return n;
};

import {
  Bundle, FieldMapArrow, Schema, ScopeArrow,
  CurrencyType, CurrencyInfo,
  CurrencyFormats, DecimalFormats,
  NumberSymbol, NumberSymbolType
} from '@phensley/cldr-schema';

import { Decimal, RoundingMode } from '../../types/numbers';
import { DecimalFormatOptions, NumberFormatMode } from './options';
import { NumberPattern, parseNumberPattern } from '../../parsing/patterns/number';
import { Cache } from '../../utils/cache';

import * as util from 'util';

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

  formatDecimal(bundle: Bundle, n: Decimal, options: DecimalFormatOptions): string {
    const format = this.decimalFormats.standard(bundle);
    console.log(this.decimalFormats.long.decimalFormat(bundle, 15, 0));
    const pattern = this.getNumberPattern(format)[n.isNegative() ? 0 : 1];

    // TODO:

    return '';
  }

  getNumberPattern(raw: string): NumberPattern[] {
    return this.numberPatternCache.get(raw);
  }
}

const adjustNumber = (
  n: Decimal,
  roundingMode: RoundingMode,
  format: NumberFormatMode,
  minIntDigits: number,
  maxFracDigits: number,
  minFracDigits: number,
  maxSigDigits: number,
  minSigDigits: number
): Decimal => {

  const usesig = format === NumberFormatMode.SIGNIFICANT || format === NumberFormatMode.SIGNIFICANT_MAXFRAC;

  if (usesig && minSigDigits > 0 && maxSigDigits > 0) {
    // Scale the number to have at most the maximum significant digits.
    if (n.precision() > maxSigDigits) {
      const scale = maxSigDigits - n.precision() + n.scale();
      n = n.setScale(scale, roundingMode);
    }

    // Ensure we don't exceed the maximum number of fraction digits allowed.
    if (format === NumberFormatMode.SIGNIFICANT_MAXFRAC && maxFracDigits < n.scale()) {
      n = n.setScale(maxFracDigits, roundingMode);
    }

    // Ensure that one less digit is emitted if the number is exactly zero.
    n = n.stripTrailingZeros();
    const zero = n.signum() === 0;
    let precision = n.precision();
    if (zero && n.scale() === 1) {
      precision--;
    }

    // scale the number to have at least the minimum significant digits
    if (precision < minSigDigits) {
      const scale = minSigDigits - precision + n.scale();
      n = n.setScale(scale, roundingMode);
    }

  } else {
    // Precise control over number of integer and decimal digits to include, e.g. when
    // formatting exact currency values.
    const scale = Math.max(minFracDigits, Math.min(n.scale(), maxFracDigits));
    n = n.setScale(scale, roundingMode);
    n = n.stripTrailingZeros();

    // Ensure minimum fraction digits is met.
    if (n.scale() < minFracDigits) {
      n = n.setScale(minFracDigits, roundingMode);
    }
  }

  return n;
};

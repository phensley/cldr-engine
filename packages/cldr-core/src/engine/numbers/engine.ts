import {
  Bundle, FieldMapArrow, Root, ScopeArrow,
  CurrencyType, CurrencyInfo,
  CurrencyFormats, DecimalFormats,
  NumberSymbol, NumberSymbolType
} from '@phensley/cldr-schema';

import { BigDecimal } from '../../types/bigdecimal';

import { CurrencyFormatOptions, DecimalFormatOptions } from './options';
import { NumberPattern, parseNumberPattern } from '../../parsing/patterns/number';

export class NumberEngine {

  private readonly currencyFormats: CurrencyFormats;
  private readonly decimalFormats: DecimalFormats;
  private readonly symbols: FieldMapArrow<NumberSymbolType>;
  private readonly currencies: ScopeArrow<CurrencyType, CurrencyInfo>;

  private readonly cache: Map<string, NumberPattern>;

  constructor(
    private readonly root: Root,
    private readonly bundle: Bundle) {
      this.currencyFormats = root.Numbers.currencyFormats;
      this.decimalFormats = root.Numbers.decimalFormats;
      this.symbols = root.Numbers.symbols;
  }

  bundleId(): string {
    return this.bundle.bundleId();
  }

  getCurrencySymbol(code: CurrencyType | string): string {
    // TODO: add option to fetch narrow symbol once Alt enum is supported.
    return this.currencies(code as CurrencyType).symbol(this.bundle);
  }

  getCurrencyDisplayName(code: CurrencyType | string): string {
    return this.currencies(code as CurrencyType).displayName(this.bundle);
  }

  formatDecimal(n: number | string | BigDecimal, options: DecimalFormatOptions): string {
    if (typeof n === 'number' || typeof n === 'string') {
      n = new BigDecimal(n);
    }
    // TODO:
    return '';
  }

  formatCurrency(n: number | string | BigDecimal, code: CurrencyType | string, options: CurrencyFormatOptions): string {
    if (typeof n === 'number' || typeof n === 'string') {
      n = new BigDecimal(n);
    }
    this.symbols(this.bundle, NumberSymbol.decimal);
    return '';
  }

  private getPattern(raw: string): NumberPattern {
    let pattern = this.cache.get(raw);
    if (pattern === undefined) {
      pattern = parseNumberPattern(raw);
      this.cache.set(raw, pattern);
    }
    return pattern;
  }
}

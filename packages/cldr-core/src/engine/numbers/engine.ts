import {
  Bundle, FieldMapArrow, Root, ScopeArrow,
  CurrencyType, CurrencyInfo,
  CurrencyFormats, DecimalFormats,
  NumberSymbol, NumberSymbolType
} from '@phensley/cldr-schema';

import { CurrencyFormatOptions, DecimalFormatOptions } from './options';

export class NumberEngine {

  private readonly currencyFormats: CurrencyFormats;
  private readonly decimalFormats: DecimalFormats;
  private readonly symbols: FieldMapArrow<NumberSymbolType>;
  private readonly currencies: ScopeArrow<CurrencyType, CurrencyInfo>;

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

  formatDecimal(n: number, options: DecimalFormatOptions): string {
    // TODO:
    return '';
  }

  formatCurrency(n: number, code: CurrencyType | string, options: CurrencyFormatOptions): string {
    // TODO:
    this.symbols(this.bundle, NumberSymbol.decimal);
    return '';
  }
}

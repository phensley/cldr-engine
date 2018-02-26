import {
  Alt,
  Bundle,
  CurrencyType,
  NumberSymbols,
  Plural,
  pluralCategory,
  PluralValues
} from '@phensley/cldr-schema';

import { NumbersInternal } from './internal';
import { CurrencyFormatOptions, CurrencySymbolWidthType, DecimalFormatOptions, NumberParams } from './options';
import { STRING_RENDERER, PARTS_RENDERER } from './render';
import { Decimal, Part } from '../../types';

export type NumberArg = number | string | Decimal;

/**
 * Number and currency formatting.
 */
export class NumbersEngine {

  private params: NumberParams;

  constructor(
    protected readonly internal: NumbersInternal,
    protected readonly bundle: Bundle) {

    const currencySpacing = internal.root.Numbers.currencyFormats.currencySpacing;
    const standardRaw = internal.root.Numbers.decimalFormats.standard(bundle);
    const standard = internal.getNumberPattern(standardRaw, false);
    this.params = {
      symbols: internal.root.Numbers.symbols(bundle),
      minimumGroupingDigits: Number(internal.root.Numbers.minimumGroupingDigits(bundle)),
      primaryGroupingSize: standard.priGroup,
      secondaryGroupingSize: standard.secGroup,
      beforeCurrency: currencySpacing.beforeCurrency(bundle),
      afterCurrency: currencySpacing.afterCurrency(bundle)
    };
  }

  /**
   * Return the symbol for the given currency.
   */
  getCurrencySymbol(code: CurrencyType, symbolWidth?: CurrencySymbolWidthType): string {
    const currencies = this.internal.Currencies(code as CurrencyType);
    const alt = symbolWidth === 'narrow' ? Alt.NARROW : Alt.NONE;
    return currencies.symbol(this.bundle, alt) || currencies.symbol(this.bundle, Alt.NONE);
  }

  /**
   * Return the display name for the given currency.
   */
  getCurrencyDisplayName(code: CurrencyType): string {
    return this.internal.Currencies(code as CurrencyType).displayName(this.bundle);
  }

  /**
   * Return the pluralized name for the given currency.
   */
  getCurrencyPluralName(code: CurrencyType, plural: string): string {
    const category = pluralCategory(plural);
    const name = this.internal.getCurrencyPluralName(this.bundle, code, category);
    return name !== '' ? name : this.internal.getCurrencyPluralName(this.bundle, code, Plural.OTHER);
  }

  formatDecimal(n: NumberArg, options: DecimalFormatOptions): string {
    const d = this.toDecimal(n);
    return this.internal.formatDecimal(this.bundle, STRING_RENDERER, d, options, this.params);
  }

  formatDecimalParts(n: NumberArg, options: DecimalFormatOptions): Part[] {
    const d = this.toDecimal(n);
    return this.internal.formatDecimal(this.bundle, PARTS_RENDERER, d, options, this.params);
  }

  formatCurrency(n: NumberArg, code: CurrencyType, options: CurrencyFormatOptions): string {
    const d = this.toDecimal(n);
    return this.internal.formatCurrency(this.bundle, STRING_RENDERER, d, code, options, this.params);
  }

  formatCurrencyParts(n: NumberArg, code: CurrencyType, options: CurrencyFormatOptions): Part[] {
    const d = this.toDecimal(n);
    return this.internal.formatCurrency(this.bundle, PARTS_RENDERER, d, code, options, this.params);
  }

  protected toDecimal(n: NumberArg): Decimal {
    return typeof n === 'number' || typeof n === 'string' ? new Decimal(n) : n;
  }
}

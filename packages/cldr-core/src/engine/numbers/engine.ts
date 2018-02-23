import {
  Alt,
  Bundle,
  CurrencyType,
  NumberSymbols,
  Plural,
  pluralCategory,
  PluralValues
} from '@phensley/cldr-schema';

import { NumbersInternal, STRING_RENDERER, PARTS_RENDERER } from './internal';
import { CurrencyFormatOptions, DecimalFormatOptions, NumberParams } from './options';
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

    this.params = {
      symbols: internal.root.Numbers.symbols(bundle),
      minimumGroupingDigits: Number(internal.root.Numbers.minimumGroupingDigits(bundle))
    };
  }

  getCurrencySymbol(code: CurrencyType | string, narrow: boolean = false): string {
    const alt = narrow ? Alt.NARROW : Alt.NONE;
    return this.internal.Currencies(code as CurrencyType).symbol(this.bundle, alt);
  }

  getCurrencyDisplayName(code: CurrencyType | string): string {
    return this.internal.Currencies(code as CurrencyType).displayName(this.bundle);
  }

  getCurrencyPluralName(code: CurrencyType | string, plural: string): string {
    return this.internal.getCurrencyPluralName(this.bundle, code, pluralCategory(plural));
  }

  formatDecimal(n: NumberArg, options: DecimalFormatOptions): string {
    const d = this.toDecimal(n);
    return this.internal.formatDecimal(this.bundle, STRING_RENDERER, d, options, this.params);
  }

  formatDecimalParts(n: NumberArg, options: DecimalFormatOptions): Part[] {
    const d = this.toDecimal(n);
    return this.internal.formatDecimal(this.bundle, PARTS_RENDERER, d, options, this.params);
  }

  formatCurrency(n: NumberArg, code: CurrencyType | string, options: CurrencyFormatOptions): string {
    const d = this.toDecimal(n);
    return this.internal.formatCurrency(this.bundle, STRING_RENDERER, d, code, options, this.params);
  }

  formatCurrencyParts(n: NumberArg, code: CurrencyType | string, options: CurrencyFormatOptions): Part[] {
    const d = this.toDecimal(n);
    return this.internal.formatCurrency(this.bundle, PARTS_RENDERER, d, code, options, this.params);
  }

  protected toDecimal(n: NumberArg): Decimal {
    return typeof n === 'number' || typeof n === 'string' ? new Decimal(n) : n;
  }
}

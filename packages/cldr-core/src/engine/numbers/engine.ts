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
import { CurrencyFormatOptions, DecimalFormatOptions, NumberParams } from './options';
import { Decimal } from '../../types/numbers';

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
    const cat: Plural = pluralCategory(plural);
    return this.internal.Currencies(code as CurrencyType).pluralName(this.bundle, cat);
  }

  formatDecimal(n: number | string | Decimal, options: DecimalFormatOptions): string {
    if (typeof n === 'number' || typeof n === 'string') {
      n = new Decimal(n);
    }
    return this.internal.formatDecimal(this.bundle, n, options, this.params);
  }

  formatCurrency(n: number | string | Decimal, code: CurrencyType | string, options: CurrencyFormatOptions): string {
    if (typeof n === 'number' || typeof n === 'string') {
      n = new Decimal(n);
    }
    return this.internal.formatCurrency(this.bundle, n, code, options, this.params);
  }
}

import {
  Alt,
  Bundle,
  CurrencyType,
  NumberSymbol,
  Plural,
  pluralCategory,
  PluralValues
} from '@phensley/cldr-schema';

import { NumbersInternal } from './internal';
import { CurrencyFormatOptions, DecimalFormatOptions } from './options';
import { Decimal } from '../../types/bignumber';

export class NumbersEngine {

  constructor(
    protected readonly internal: NumbersInternal,
    protected readonly bundle: Bundle) {
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
    // TODO:
    return n.toString();
  }

  formatCurrency(n: number | string | Decimal, code: CurrencyType | string, options: CurrencyFormatOptions): string {
    if (typeof n === 'number' || typeof n === 'string') {
      n = new Decimal(n);
    }
    this.internal.symbols(this.bundle, NumberSymbol.decimal);
    return '';
  }
}

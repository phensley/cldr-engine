import {
  pluralCategory,
  pluralString,
  Alt,
  Bundle,
  CurrencyType,
  Numbers,
  NumberSymbols,
  NumberSystemInfo,
  NumberSystemName,
  Plural,
  PluralValues
} from '@phensley/cldr-schema';

import { NumbersInternal } from './internal';
import {
  CurrencyFormatOptions,
  CurrencySymbolWidthType,
  DecimalFormatOptions,
  NumberParams,
  NumberSystemType
} from './options';
import { NumberParamsCache } from './params';
import { pluralCardinal, pluralOrdinal } from '../plurals';
import { STRING_RENDERER, PARTS_RENDERER } from './render';
import { coerceDecimal, Decimal, DecimalArg, Part } from '../../types';
import { LRU } from '../../utils/lru';

/**
 * Number and currency formatting.
 */
export class NumbersEngine {

  private numberParams: NumberParamsCache;

  constructor(
    protected readonly internal: NumbersInternal,
    protected readonly bundle: Bundle) {

    this.numberParams = new NumberParamsCache(bundle, internal);
  }

  getNumberParams(numberSystem?: NumberSystemType): NumberParams {
    return this.numberParams.getNumberParams(numberSystem);
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

  getPluralCardinal(n: DecimalArg): string {
    const d = coerceDecimal(n);
    const cat = pluralCardinal(this.bundle.language(), d.operands());
    return pluralString(cat);
  }

  getPluralOrdinal(n: DecimalArg): string {
    const d = coerceDecimal(n);
    const cat = pluralOrdinal(this.bundle.language(), d.operands());
    return pluralString(cat);
  }

  formatDecimal(n: DecimalArg, options: DecimalFormatOptions = {}): string {
    const d = coerceDecimal(n);
    const params = this.numberParams.getNumberParams(options.nu);
    const [result, plural] = this.internal.formatDecimal(this.bundle, STRING_RENDERER, d, options, params);
    return result;
  }

  formatDecimalParts(n: DecimalArg, options: DecimalFormatOptions = {}): Part[] {
    const d = coerceDecimal(n);
    const params = this.numberParams.getNumberParams(options.nu);
    const [result, plural] = this.internal.formatDecimal(this.bundle, PARTS_RENDERER, d, options, params);
    return result;
  }

  formatCurrency(n: DecimalArg, code: CurrencyType, options: CurrencyFormatOptions = {}): string {
    const d = coerceDecimal(n);
    const params = this.numberParams.getNumberParams(options.nu, 'finance');
    return this.internal.formatCurrency(this.bundle, STRING_RENDERER, d, code, options, params);
  }

  formatCurrencyParts(n: DecimalArg, code: CurrencyType, options: CurrencyFormatOptions = {}): Part[] {
    const d = coerceDecimal(n);
    const params = this.numberParams.getNumberParams(options.nu);
    return this.internal.formatCurrency(this.bundle, PARTS_RENDERER, d, code, options, params);
  }

}

import {
  pluralCategory,
  pluralString,
  Alt,
  Bundle,
  CurrencyType,
  Numbers,
  NumberSymbols,
  Plural,
  PluralValues
} from '@phensley/cldr-schema';

import { NumbersInternal } from './internal';
import { CurrencyFormatOptions, CurrencySymbolWidthType, DecimalFormatOptions, NumberParams } from './options';
import { pluralCardinal, pluralOrdinal } from '../plurals';
import { STRING_RENDERER, PARTS_RENDERER } from './render';
import { coerceDecimal, Decimal, DecimalArg, Part } from '../../types';

/**
 * Locale-specific number parameters.
 */
export const getNumberParams = (bundle: Bundle, internal: NumbersInternal): NumberParams => {
  const root = internal.root;
  const currencySpacing = root.Numbers.currencyFormats.currencySpacing;
  const standardRaw = root.Numbers.decimalFormats.standard(bundle);
  const standard = internal.getNumberPattern(standardRaw, false);
  return {
    symbols: root.Numbers.symbols(bundle),
    minimumGroupingDigits: Number(root.Numbers.minimumGroupingDigits(bundle)),
    primaryGroupingSize: standard.priGroup,
    secondaryGroupingSize: standard.secGroup,
    beforeCurrency: currencySpacing.beforeCurrency(bundle),
    afterCurrency: currencySpacing.afterCurrency(bundle)
  };
};

/**
 * Number and currency formatting.
 */
export class NumbersEngine {

  private params: NumberParams;

  constructor(
    protected readonly internal: NumbersInternal,
    protected readonly bundle: Bundle) {

    this.params = getNumberParams(bundle, internal);
  }

  getNumberParams(): NumberParams {
    return this.params;
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

  formatDecimal(n: DecimalArg, options: DecimalFormatOptions): string {
    const d = coerceDecimal(n);
    const [result, plural] = this.internal.formatDecimal(this.bundle, STRING_RENDERER, d, options, this.params);
    return result;
  }

  formatDecimalParts(n: DecimalArg, options: DecimalFormatOptions): Part[] {
    const d = coerceDecimal(n);
    const [result, plural] = this.internal.formatDecimal(this.bundle, PARTS_RENDERER, d, options, this.params);
    return result;
  }

  formatCurrency(n: DecimalArg, code: CurrencyType, options: CurrencyFormatOptions): string {
    const d = coerceDecimal(n);
    return this.internal.formatCurrency(this.bundle, STRING_RENDERER, d, code, options, this.params);
  }

  formatCurrencyParts(n: DecimalArg, code: CurrencyType, options: CurrencyFormatOptions): Part[] {
    const d = coerceDecimal(n);
    return this.internal.formatCurrency(this.bundle, PARTS_RENDERER, d, code, options, this.params);
  }
}

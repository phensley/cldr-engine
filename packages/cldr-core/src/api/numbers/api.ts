import {
  CurrencyType,
  NumberSystemInfo,
  NumberSystemName,
  PluralType,
  Schema
} from '@phensley/cldr-schema';

import {
  CurrencyFormatOptions,
  CurrencySymbolWidthType,
  DecimalFormatOptions,
  NumberSystemType
} from '../../common';

import { Bundle } from '../../resource';
import { Cache } from '../../utils/cache';
import { NumberParams } from '../../common/private';
import { Numbers } from '../api';
import { PrivateApiImpl } from '../private';
import { Internals, NumberRenderer, NumberInternals, PluralInternals } from '../../internals';
import { NumberingSystem } from '../../systems/numbering';
import { coerceDecimal, Decimal, DecimalArg, Part } from '../../types';

/**
 * Number and currency formatting.
 */
export class NumbersImpl implements Numbers {

  private plurals: PluralInternals;
  private numbers: NumberInternals;

  constructor(
    protected readonly bundle: Bundle,
    protected readonly internal: Internals,
    protected readonly privateApi: PrivateApiImpl
  ) {
    this.numbers = internal.numbers;
    this.plurals = internal.plurals;
  }

  getCurrencySymbol(code: CurrencyType, width?: CurrencySymbolWidthType): string {
    return this.numbers.getCurrencySymbol(this.bundle, code, width);
    // const currencies = this.numbers.getCurrency(code as CurrencyType);

    // const alt = width === 'narrow' ? Alt.NARROW : Alt.NONE;
    // return currencies.symbol(this.bundle, alt) || currencies.symbol(this.bundle, Alt.NONE);
  }

  getCurrencyDisplayName(code: CurrencyType): string {
    return this.numbers.getCurrencyDisplayName(this.bundle, code);
    // const currencies = this.numbers.getCurrency(code as CurrencyType);
    // return currencies.displayName(this.bundle);
  }

  getCurrencyPluralName(code: CurrencyType, plural: PluralType): string {
    // const category = pluralCategory(plural);
    const name = this.numbers.getCurrencyPluralName(this.bundle, code, plural);
    return name !== '' ? name : this.numbers.getCurrencyPluralName(this.bundle, code, 'other');
  }

  getPluralCardinal(n: DecimalArg): string {
    const d = coerceDecimal(n);
    return this.plurals.cardinal(this.bundle.language(), d.operands());
  }

  getPluralOrdinal(n: DecimalArg): string {
    const d = coerceDecimal(n);
    return this.plurals.ordinal(this.bundle.language(), d.operands());
  }

  formatDecimal(n: DecimalArg, options?: DecimalFormatOptions): string {
    const renderer = this.numbers.stringRenderer();
    return this.formatDecimalImpl(n, renderer, options || {});
  }

  formatDecimalToParts(n: DecimalArg, options?: DecimalFormatOptions): Part[] {
    const renderer = this.numbers.partsRenderer();
    return this.formatDecimalImpl(n, renderer, options || {});
  }

  formatCurrency(n: DecimalArg, code: CurrencyType, options?: CurrencyFormatOptions): string {
    const renderer = this.numbers.stringRenderer();
    return this.formatCurrencyImpl(renderer, n, code, options || {});
  }

  formatCurrencyToParts(n: DecimalArg, code: CurrencyType, options?: CurrencyFormatOptions): Part[] {
    const renderer = this.numbers.partsRenderer();
    return this.formatCurrencyImpl(renderer, n, code, options || {});
  }

  protected formatDecimalImpl<T>(n: DecimalArg, renderer: NumberRenderer<T>, options: DecimalFormatOptions): T {
    const d = coerceDecimal(n);
    const params = this.privateApi.getNumberParams(options.nu);
    const [result, plural] = this.numbers.formatDecimal(this.bundle, renderer, d, options, params);
    return result;
  }

  protected formatCurrencyImpl<T>(renderer: NumberRenderer<T>, n: DecimalArg,
      code: CurrencyType, options: CurrencyFormatOptions): T {

    const d = coerceDecimal(n);
    const params = this.privateApi.getNumberParams(options.nu, 'finance');
    return this.numbers.formatCurrency(this.bundle, renderer, d, code, options, params);
  }

}

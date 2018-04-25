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
import {
  Internals,
  NumberRenderer,
  NumberInternals,
  PluralInternals,
} from '../../internals';
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
  }

  getCurrencyDisplayName(code: CurrencyType): string {
    return this.numbers.getCurrencyDisplayName(this.bundle, code);
  }

  getCurrencyPluralName(code: CurrencyType, plural: PluralType): string {
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
    options = options || {};
    const params = this.privateApi.getNumberParams(options.nu);
    const renderer = this.numbers.stringRenderer(params);
    return this.formatDecimalImpl(renderer, params, n, options);
  }

  formatDecimalToParts(n: DecimalArg, options?: DecimalFormatOptions): Part[] {
    options = options || {};
    const params = this.privateApi.getNumberParams(options.nu);
    const renderer = this.numbers.partsRenderer(params);
    return this.formatDecimalImpl(renderer, params, n, options);
  }

  formatCurrency(n: DecimalArg, code: CurrencyType, options?: CurrencyFormatOptions): string {
    options = options || {};
    const params = this.privateApi.getNumberParams(options.nu, 'finance');
    const renderer = this.numbers.stringRenderer(params);
    return this.formatCurrencyImpl(renderer, params, n, code, options);
  }

  formatCurrencyToParts(n: DecimalArg, code: CurrencyType, options?: CurrencyFormatOptions): Part[] {
    options = options || {};
    const params = this.privateApi.getNumberParams(options.nu, 'finance');
    const renderer = this.numbers.partsRenderer(params);
    return this.formatCurrencyImpl(renderer, params, n, code, options || {});
  }

  protected formatDecimalImpl<T>(renderer: NumberRenderer<T>, params: NumberParams,
      n: DecimalArg, options: DecimalFormatOptions): T {
    const [result, plural] = this.numbers.formatDecimal(this.bundle, renderer, coerceDecimal(n), options, params);
    return result;
  }

  protected formatCurrencyImpl<T>(renderer: NumberRenderer<T>, params: NumberParams,
      n: DecimalArg, code: CurrencyType, options: CurrencyFormatOptions): T {
    return this.numbers.formatCurrency(this.bundle, renderer, coerceDecimal(n), code, options, params);
  }

}

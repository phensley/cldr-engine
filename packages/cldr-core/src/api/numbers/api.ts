import {
  CurrencyType,
  PluralType,
} from '@phensley/cldr-schema';

import {
  CurrencyFormatOptions,
  CurrencyFractions,
  CurrencySymbolWidthType,
  DecimalFormatOptions
} from '../../common';

import { Bundle } from '../../resource';
import { NumberParams } from '../../common/private';
import { Numbers } from '../api';
import { PrivateApiImpl } from '../private';
import {
  getCurrencyForRegion,
  getCurrencyFractions,
  Internals,
  NumberInternals,
  NumberRenderer,
  PluralInternals,
} from '../../internals';
import { coerceDecimal, DecimalArg, Part } from '../../types';

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

  getCurrencyFractions(code: CurrencyType): CurrencyFractions {
    return getCurrencyFractions(code);
  }

  getCurrencyForRegion(region: string): CurrencyType {
    return getCurrencyForRegion(region);
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
    return this.formatCurrencyImpl(renderer, params, n, code, options);
  }

  protected formatDecimalImpl<T>(renderer: NumberRenderer<T>, params: NumberParams,
      n: DecimalArg, options: DecimalFormatOptions): T {

    // A NaN or Infinity value will just return the locale's representation
    const v = validate(n, options, renderer, params);
    if (v !== undefined) {
      return v;
    }
    const [result] = this.numbers.formatDecimal(this.bundle, renderer, coerceDecimal(n), options, params);
    return result;
  }

  protected formatCurrencyImpl<T>(renderer: NumberRenderer<T>, params: NumberParams,
      n: DecimalArg, code: CurrencyType, options: CurrencyFormatOptions): T {

    // Not much to be done with NaN and Infinity with currencies, so we always
    // throw an error.
    validate(n, FORCE_ERRORS, renderer, params);
    return this.numbers.formatCurrency(this.bundle, renderer, coerceDecimal(n), code, options, params);
  }

}
const FORCE_ERRORS: DecimalFormatOptions = { errors: ['nan', 'infinity' ]};

/**
 * Check if the number is a NaN or Infinity and whether this should throw
 * an error, or return the locale's string representation.
 */
const validate = <T>(
  n: DecimalArg,
  opts: DecimalFormatOptions,
  renderer: NumberRenderer<T>,
  params: NumberParams): T | undefined => {

  if (typeof n !== 'number' || isFinite(n)) {
    return undefined;
  }

  // Check if we have NaN or Infinity
  const isnan = isNaN(n);
  const isinfinity = !isnan && !isFinite(n);

  if (Array.isArray(opts.errors)) {
    // Check if we should throw an error on either of these
    if (isnan && opts.errors.indexOf('nan') !== -1) {
      throw Error(`Invalid argument: NaN`);
    }
    if (isinfinity && opts.errors.indexOf('infinity') !== -1) {
      throw Error(`Invalid argument: Infinity`);
    }
  }

  return isnan ? renderer.make('nan', params.symbols.nan)
    : isinfinity ? renderer.make('infinity', params.symbols.infinity)
    : undefined;
};

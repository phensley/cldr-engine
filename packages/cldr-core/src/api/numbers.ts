import { ContextType, CurrencyType, PluralType } from '@phensley/cldr-schema';
import { coerceDecimal, Decimal, DecimalArg, Part } from '@phensley/decimal';

import {
  CurrencyDisplayNameOptions,
  CurrencyFormatOptions,
  CurrencyFractions,
  CurrencySymbolWidthType,
  DecimalAdjustOptions,
  DecimalFormatOptions,
  // RuleBasedFormatOptions
} from '../common';

import { Bundle } from '../resource';
import { ContextTransformInfo, NumberParams } from '../common/private';
import { Numbers } from './api';
import { PrivateApiImpl } from './private';
import {
  getCurrencyForRegion,
  getCurrencyFractions,
  GeneralInternals,
  NumberInternals,
  NumberRenderer,
} from '../internals';
import { pluralRules } from '@phensley/plurals';
// import { AlgorithmicNumberingSystems } from '../systems';

const DEFAULT_CURRENCY_OPTIONS: CurrencyDisplayNameOptions = { context: 'begin-sentence' };

/**
 * Number and currency formatting.
 */
export class NumbersImpl implements Numbers {

  protected transform: ContextTransformInfo;
  // protected algorithmic: AlgorithmicNumberingSystems;

  constructor(
    private readonly bundle: Bundle,
    private readonly numbers: NumberInternals,
    private readonly general: GeneralInternals,
    private readonly privateApi: PrivateApiImpl
  ) {
    this.transform = privateApi.getContextTransformInfo();
    // this.algorithmic = new AlgorithmicNumberingSystems(bundle.spellout(),
    //   bundle.tag().expanded(), bundle.languageScript());
  }

  adjustDecimal(n: DecimalArg, opts?: DecimalAdjustOptions): Decimal {
    return this.numbers.adjustDecimal(coerceDecimal(n), opts);
  }

  getCurrencySymbol(code: CurrencyType, width?: CurrencySymbolWidthType): string {
    return this.numbers.getCurrencySymbol(this.bundle, code, width);
  }

  getCurrencyDisplayName(code: CurrencyType, opts: CurrencyDisplayNameOptions = DEFAULT_CURRENCY_OPTIONS): string {
    const name = this.numbers.getCurrencyDisplayName(this.bundle, code);
    return this.general.contextTransform(name, this.transform, _ctx(opts), 'currencyName');
  }

  getCurrencyFractions(code: CurrencyType): CurrencyFractions {
    return getCurrencyFractions(code);
  }

  getCurrencyForRegion(region: string): CurrencyType {
    return getCurrencyForRegion(region);
  }

  getCurrencyPluralName(n: DecimalArg, code: string,
      opts: CurrencyDisplayNameOptions = DEFAULT_CURRENCY_OPTIONS): string {
    const plural = this.getPluralCardinal(n);
    const name = this.numbers.getCurrencyPluralName(this.bundle, code, plural as PluralType);
    return this.general.contextTransform(name, this.transform, _ctx(opts), 'currencyName');
  }

  getPluralCardinal(n: DecimalArg, options?: DecimalAdjustOptions): string {
    const d = options ? this.adjustDecimal(n, options) : coerceDecimal(n);
    return pluralRules.cardinal(this.bundle.language(), d.operands());
  }

  getPluralOrdinal(n: DecimalArg, options?: DecimalAdjustOptions): string {
    const d = options ? this.adjustDecimal(n, options) : coerceDecimal(n);
    return pluralRules.ordinal(this.bundle.language(), d.operands());
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

  // formatRuleBased(n: DecimalArg, options?: RuleBasedFormatOptions): string {
  //   options = options || {};
  //   const rule = options.rule || 'spellout-numbering';
  //   const params = this.privateApi.getNumberParams('latn', 'default');
  //   const system = this.algorithmic.rbnf(rule, params.symbols);
  //   const info = this.privateApi.getContextTransformInfo();
  //   return system ?
  //     this.numbers.formatRuleBased(this.bundle, this.numbers.stringRenderer(params),
  //       system, info, coerceDecimal(n), options, params) : '';
  // }

  // ruleBasedFormatNames(): string[] {
  //   return this.algorithmic.rulenames.slice(0);
  // }

  protected formatDecimalImpl<T>(renderer: NumberRenderer<T>, params: NumberParams,
      n: DecimalArg, options: DecimalFormatOptions): T {

    // A NaN or Infinity value will just return the locale's representation
    const d = coerceDecimal(n);
    const v = validate(d, options, renderer, params);
    if (v !== undefined) {
      return v;
    }
    const [result] = this.numbers.formatDecimal(this.bundle, renderer, d, options, params);
    return result;
  }

  protected formatCurrencyImpl<T>(renderer: NumberRenderer<T>, params: NumberParams,
      n: DecimalArg, code: CurrencyType, options: CurrencyFormatOptions): T {

    // Not much to be done with NaN and Infinity with currencies, so we always
    // throw an error.
    const d = coerceDecimal(n);
    validate(d, FORCE_ERRORS, renderer, params);
    return this.numbers.formatCurrency(this.bundle, renderer, coerceDecimal(n), code, options, params);
  }

}
const FORCE_ERRORS: DecimalFormatOptions = { errors: ['nan', 'infinity' ]};

/**
 * Check if the number is a NaN or Infinity and whether this should throw
 * an error, or return the locale's string representation.
 */
const validate = <T>(
  n: Decimal,
  opts: DecimalFormatOptions,
  renderer: NumberRenderer<T>,
  params: NumberParams): T | undefined => {

  // Check if we have NaN or Infinity
  const isnan = n.isNaN();
  const isinfinity = n.isInfinity();

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

// Default an options context value
const _ctx = (o: CurrencyDisplayNameOptions) => _def(o, 'context', 'begin-sentence' as ContextType);

// Default an option value
const _def = <O, K extends keyof O, T>(o: O, k: K, t: T): T =>
  (o ? (o[k] as unknown as T) : t) || t;

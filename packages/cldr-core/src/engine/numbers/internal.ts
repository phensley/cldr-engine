import {
  Alt,
  Bundle,
  CurrencyType,
  CurrencyInfo,
  CurrencyFormats,
  CurrencyValues,
  DecimalFormats,
  FieldMapArrow,
  NumberSymbol,
  Plural,
  Schema,
  ScopeArrow
} from '@phensley/cldr-schema';

import { Decimal, RoundingMode, Part } from '../../types';
import { NumberContext } from './context';
import {
  CurrencyFormatOptions,
  CurrencyFormatStyle,
  CurrencySymbolWidth,
  DecimalFormatOptions,
  DecimalFormatStyle,
  NumberFormatMode,
  NumberParams
} from './options';

import { NumberPattern, parseNumberPattern, NumberField } from '../../parsing/patterns/number';
import { Cache } from '../../utils/cache';
import { getCurrencyFractions } from './util';
import { pluralCardinal } from '../plurals';
import { WrapperInternal } from '../wrapper';

/**
 * Number internal engine singleton, shared across all locales.
 */
export class NumbersInternal {

  readonly Currencies: ScopeArrow<CurrencyType, CurrencyInfo>;
  readonly currencyFormats: CurrencyFormats;
  readonly decimalFormats: DecimalFormats;

  protected readonly numberPatternCache: Cache<NumberPattern[]>;

  constructor(
    readonly root: Schema,
    readonly wrapper: WrapperInternal,
    cacheSize: number = 50) {

    this.Currencies = root.Currencies;
    this.currencyFormats = root.Numbers.currencyFormats;
    this.decimalFormats = root.Numbers.decimalFormats;
    this.numberPatternCache = new Cache(parseNumberPattern, cacheSize);
  }

  formatDecimal<T>(bundle: Bundle, renderer: Renderer<T>,
    n: Decimal, options: DecimalFormatOptions, params: NumberParams): T {

    const style = options.style === undefined ? DecimalFormatStyle.DECIMAL : options.style;
    switch (style) {
    case DecimalFormatStyle.LONG:

    case DecimalFormatStyle.SHORT:

    case DecimalFormatStyle.PERCENT:
    case DecimalFormatStyle.PERCENT_SCALED:

    case DecimalFormatStyle.PERMILLE:
    case DecimalFormatStyle.PERMILLE_SCALED:

    case DecimalFormatStyle.DECIMAL:
    {
      const raw = this.decimalFormats.standard(bundle);
      const pattern = this.getNumberPattern(raw, n.isNegative());
      const formatMode = orDefault(options.formatMode, NumberFormatMode.DEFAULT);
      const ctx = new NumberContext(options, formatMode, -1);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
      return renderer.render(n, pattern, params, '', '', options.group === true, ctx.minInt);
    }
    }

    // No valid style matched
    return renderer.empty();
  }

  formatCurrency<T>(bundle: Bundle, renderer: Renderer<T>,
    n: Decimal, code: string, options: CurrencyFormatOptions, params: NumberParams): T {

    const fractions = getCurrencyFractions(code);
    const width = options.symbolWidth === 'narrow' ? Alt.NARROW : Alt.NONE;
    const style = options.style === undefined ? CurrencyFormatStyle.SYMBOL : options.style;

    switch (style) {

    case CurrencyFormatStyle.CODE:
    case CurrencyFormatStyle.NAME:
    {
      const raw = this.decimalFormats.standard(bundle);
      const pattern = this.getNumberPattern(raw, n.isNegative());

      const ctx = new NumberContext(options, NumberFormatMode.DEFAULT, fractions.digits);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);

      const operands = n.operands();
      const plural = pluralCardinal(bundle.language(), operands);

      const num = renderer.render(n, pattern, params, '', '', options.group === true, ctx.minInt);
      const unit = style === CurrencyFormatStyle.CODE ? code : this.getCurrencyPluralName(bundle, code, plural);
      return renderer.wrap(this.wrapper, '{0} {1}', num, renderer.part('unit', unit));
    }

    case CurrencyFormatStyle.SHORT:
    {
      const digits = n.integerDigits();
      const divisor = this.currencyFormats.short.standardDivisor(bundle, digits);
      const ctx = new NumberContext(options, NumberFormatMode.SIGNIFICANT_MAXFRAC, fractions.digits);
      const symbol = this.Currencies(code as CurrencyType).symbol(bundle, width);
      const operands = n.operands();

      let raw = this.currencyFormats.short.standard(bundle, digits, Plural.OTHER);
      break;
    }

    case CurrencyFormatStyle.ACCOUNTING:
    case CurrencyFormatStyle.SYMBOL:
    {
      const symbol = this.Currencies(code as CurrencyType).symbol(bundle, width);
      const raw = style === CurrencyFormatStyle.SYMBOL ?
        this.currencyFormats.standard(bundle) : this.currencyFormats.accounting(bundle);
      const pattern = this.getNumberPattern(raw, n.isNegative());
      const formatMode = orDefault(options.formatMode, NumberFormatMode.SIGNIFICANT_MAXFRAC);
      const ctx = new NumberContext(options, formatMode, fractions.digits);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
      return renderer.render(n, pattern, params, symbol, '', options.group === true, ctx.minInt);
    }
    }

    // No valid style matched
    return renderer.empty();
  }

  getCurrencyPluralName(bundle: Bundle, code: string, plural: Plural): string {
    return this.Currencies(code as CurrencyType).pluralName(bundle, plural);
  }

  protected getNumberPattern(raw: string, negative: boolean): NumberPattern {
    return this.numberPatternCache.get(raw)[negative ? 1 : 0];
  }

}

const orDefault = <T>(v: T | undefined, alt: T): T => v === undefined ? alt : v;

export interface Renderer<T> {
  render(n: Decimal, pattern: NumberPattern,
    params: NumberParams, currency: string, percent: string, group: boolean, minInt: number): T;
  wrap(internal: WrapperInternal, pattern: string, ...args: T[]): T;
  part(type: string, value: string): T;
  empty(): T;
}

/**
 * Renders each node in the NumberPattern to a string.
 */
export class StringRenderer implements Renderer<string> {
  render(n: Decimal, pattern: NumberPattern,
    params: NumberParams, currency: string, percent: string, group: boolean, minInt: number): string {

    let s = '';
    for (const node of pattern.nodes) {
      if (typeof node === 'string') {
        s += node;
      } else {
        switch (node) {
        case NumberField.CURRENCY:
          s += currency;
          break;

        case NumberField.MINUS:
          s += params.symbols.minusSign;
          break;

        case NumberField.NUMBER:
          s += n.format(
            params.symbols.decimal,
            group ? params.symbols.group : '',
            minInt,
            params.minimumGroupingDigits,
            pattern.priGroup,
            pattern.secGroup
          );
          break;

        case NumberField.PERCENT:
          s += percent;
          break;
        }
      }
    }
    return s;
  }

  wrap(internal: WrapperInternal, pattern: string, ...args: string[]): string {
    return internal.format(pattern, args);
  }

  part(type: string, value: string): string {
    return value;
  }

  empty(): string {
    return '';
  }
}

export class PartsRenderer implements Renderer<Part[]> {
  render(n: Decimal, pattern: NumberPattern,
    params: NumberParams, currency: string, percent: string, group: boolean, minInt: number): Part[] {

    let r: Part[] = [];
      for (const node of pattern.nodes) {
        if (typeof node === 'string') {
          r.push({ type: 'literal', value: node });
        } else {
          switch (node) {
          case NumberField.CURRENCY:
            r.push({ type: 'currency', value: currency });
            break;

          case NumberField.MINUS:
            r.push({ type: 'minus', value: params.symbols.minusSign });
            break;

          case NumberField.NUMBER:
            r = r.concat(n.formatParts(
              params.symbols.decimal,
              group ? params.symbols.group : '',
              minInt,
              params.minimumGroupingDigits,
              pattern.priGroup,
              pattern.secGroup
            ));
            break;

          case NumberField.PERCENT:
            r.push({ type: 'percent', value: percent });
            break;
          }
        }
      }
    return r;
  }

  wrap(internal: WrapperInternal, pattern: string, ...args: Part[][]): Part[] {
    return internal.formatParts(pattern, args);
  }

  part(type: string, value: string): Part[] {
    return [{ type, value }];
  }

  empty(): Part[] {
    return [];
  }
}

export const STRING_RENDERER = new StringRenderer();

export const PARTS_RENDERER = new PartsRenderer();

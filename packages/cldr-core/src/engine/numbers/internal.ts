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

import { Decimal, RoundingMode } from '../../types/numbers';
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

/**
 * Number internal engine singleton, shared across all locales.
 */
export class NumbersInternal {

  readonly Currencies: ScopeArrow<CurrencyType, CurrencyInfo>;
  readonly currencyFormats: CurrencyFormats;
  readonly decimalFormats: DecimalFormats;

  protected readonly numberPatternCache: Cache<NumberPattern[]>;

  constructor(readonly root: Schema, cacheSize: number = 50) {
    this.Currencies = root.Currencies;
    this.currencyFormats = root.Numbers.currencyFormats;
    this.decimalFormats = root.Numbers.decimalFormats;
    this.numberPatternCache = new Cache(parseNumberPattern, cacheSize);
  }

  formatDecimal(bundle: Bundle, n: Decimal, options: DecimalFormatOptions, params: NumberParams): string {
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
      return render(n, pattern, params, '', '', options.group === true, ctx.minInt);
    }
    }

    // No valid style matched
    return '';
  }

  formatCurrency(
    bundle: Bundle, n: Decimal, code: string, options: CurrencyFormatOptions, params: NumberParams): string {
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

      const num = render(n, pattern, params, '', '', options.group === true, ctx.minInt);
      const unit = style === CurrencyFormatStyle.CODE ? code : this.getCurrencyPluralName(bundle, code, plural);
      // TODO: unit wrapper
      return `${num} ${unit}`;
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
      return render(n, pattern, params, symbol, '', options.group === true, ctx.minInt);
    }
    }

    // No valid style matched
    return '';
  }

  getCurrencyPluralName(bundle: Bundle, code: string, plural: Plural): string {
    return this.Currencies(code as CurrencyType).pluralName(bundle, plural);
  }

  protected getNumberPattern(raw: string, negative: boolean): NumberPattern {
    return this.numberPatternCache.get(raw)[negative ? 1 : 0];
  }

}

const orDefault = <T>(v: T | undefined, alt: T): T => v === undefined ? alt : v;

/**
 * Renders each node in the NumberPattern to a string.
 */
const render = (
  n: Decimal,
  pattern: NumberPattern,
  params: NumberParams,
  currency: string,
  percent: string,
  group: boolean,
  minInt: number): string => {

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
};

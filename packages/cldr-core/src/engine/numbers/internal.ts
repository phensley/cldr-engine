import {
  Alt,
  Bundle,
  CurrencyType,
  CurrencyInfo,
  CurrencyFormats,
  CurrencyValues,
  DecimalFormats,
  DigitsArrow,
  DivisorArrow,
  FieldMapArrow,
  NumberSymbol,
  PercentFormats,
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
  NumberParams
} from './options';

import { Renderer } from './render';
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
  readonly percentFormats: PercentFormats;

  protected readonly numberPatternCache: Cache<NumberPattern[]>;

  constructor(
    readonly root: Schema,
    readonly wrapper: WrapperInternal,
    cacheSize: number = 50) {

    this.Currencies = root.Currencies;
    this.currencyFormats = root.Numbers.currencyFormats;
    this.decimalFormats = root.Numbers.decimalFormats;
    this.percentFormats = root.Numbers.percentFormats;
    this.numberPatternCache = new Cache(parseNumberPattern, cacheSize);
  }

  formatDecimal<T>(bundle: Bundle, renderer: Renderer<T>,
    n: Decimal, options: DecimalFormatOptions, params: NumberParams): T {

    const style = options.style === undefined ? DecimalFormatStyle.DECIMAL : options.style;
    switch (style) {
    case DecimalFormatStyle.LONG:
    case DecimalFormatStyle.SHORT:
    {
      const standardRaw = this.decimalFormats.standard(bundle);
      const isShort = style === DecimalFormatStyle.SHORT;
      const divisorImpl = isShort ? this.decimalFormats.short.decimalFormatDivisor
        : this.decimalFormats.long.decimalFormatDivisor;
      const patternImpl = isShort ? this.decimalFormats.short.decimalFormat
        : this.decimalFormats.long.decimalFormat;
      const ctx = new NumberContext(options);

      // Adjust the number using the compact pattern and divisor.
      const [q2, ndigits] = this.setupCompact(bundle, n, ctx, standardRaw, patternImpl, divisorImpl);

      // Compute the plural category for the final q2.
      const operands = q2.operands();
      const plural = pluralCardinal(bundle.language(), operands);

      // Select the final pluralized compact pattern based on the integer
      // digits of n and the plural category of the rounded / shifted number q2.
      const raw = patternImpl(bundle, ndigits, plural) || standardRaw;
      const pattern = this.getNumberPattern(raw, q2.isNegative());
      return renderer.render(q2, pattern, params, '', '', options.group, ctx.minInt);
    }

    case DecimalFormatStyle.PERCENT:
    case DecimalFormatStyle.PERCENT_SCALED:
    case DecimalFormatStyle.PERMILLE:
    case DecimalFormatStyle.PERMILLE_SCALED:
    {
      // Get percent pattern.
      const raw = this.percentFormats.standard(bundle);
      let pattern = this.getNumberPattern(raw, n.isNegative());

      // Scale the number to a percent or permille form as needed.
      if (style === DecimalFormatStyle.PERCENT) {
        n = n.movePoint(2);
      } else if (style === DecimalFormatStyle.PERMILLE) {
        n = n.movePoint(3);
      }

      // Select percent or permille symbol.
      const symbol = (style === DecimalFormatStyle.PERCENT || style === DecimalFormatStyle.PERCENT_SCALED) ?
        params.symbols.percentSign : params.symbols.perMille;

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, -1);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
      pattern = this.getNumberPattern(raw, n.isNegative());
      return renderer.render(n, pattern, params, '', symbol, options.group, ctx.minInt);
    }

    case DecimalFormatStyle.DECIMAL:
    {
      // Get decimal pattern.
      const raw = this.decimalFormats.standard(bundle);
      let pattern = this.getNumberPattern(raw, n.isNegative());

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, -1);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
      pattern = this.getNumberPattern(raw, n.isNegative());
      return renderer.render(n, pattern, params, '', '', options.group, ctx.minInt);
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

    const standardRaw = this.currencyFormats.standard(bundle);

    switch (style) {

    case CurrencyFormatStyle.CODE:
    case CurrencyFormatStyle.NAME:
    {
      const raw = this.decimalFormats.standard(bundle);
      let pattern = this.getNumberPattern(raw, n.isNegative());

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, fractions.digits);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
      pattern = this.getNumberPattern(raw, n.isNegative());
      const num = renderer.render(n, pattern, params, '', '', options.group, ctx.minInt);

      // Compute plural category and select pluralized unit.
      const operands = n.operands();
      const plural = pluralCardinal(bundle.language(), operands);
      const unit = style === CurrencyFormatStyle.CODE ? code : this.getCurrencyPluralName(bundle, code, plural);

      // Wrap number and unit together.
      const unitWrapper = this.currencyFormats.unitPattern(bundle, plural);
      return renderer.wrap(this.wrapper, unitWrapper, num, renderer.part('unit', unit));
    }

    case CurrencyFormatStyle.SHORT:
    {
      // The extra complexity here is to deal with rounding up and selecting the
      // correct pluralized pattern for the final rounded form.
      const divisorImpl = this.currencyFormats.short.standardDivisor;
      const patternImpl = this.currencyFormats.short.standard;
      const ctx = new NumberContext(options, fractions.digits);
      const symbol = this.Currencies(code as CurrencyType).symbol(bundle, width);

      // Adjust the number using the compact pattern and divisor.
      const [q2, ndigits] = this.setupCompact(bundle, n, ctx, standardRaw, patternImpl, divisorImpl);

      // Compute the plural category for the final q2.
      const operands = q2.operands();
      const plural = pluralCardinal(bundle.language(), operands);

      // Select the final pluralized compact pattern based on the integer
      // digits of n and the plural category of the rounded / shifted number q2.
      const raw = patternImpl(bundle, ndigits, plural) || standardRaw;
      const pattern = this.getNumberPattern(raw, q2.isNegative());
      return renderer.render(q2, pattern, params, symbol, '', options.group, ctx.minInt);
    }

    case CurrencyFormatStyle.ACCOUNTING:
    case CurrencyFormatStyle.SYMBOL:
    {
      // Select standard or accounting pattern based on style.
      const raw = style === CurrencyFormatStyle.SYMBOL ?
        this.currencyFormats.standard(bundle) : this.currencyFormats.accounting(bundle);
        let pattern = this.getNumberPattern(raw, n.isNegative());

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, fractions.digits);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
      pattern = this.getNumberPattern(raw, n.isNegative());
      const symbol = this.Currencies(code as CurrencyType).symbol(bundle, width);
      return renderer.render(n, pattern, params, symbol, '', options.group, ctx.minInt);
    }
    }

    // No valid style matched
    return renderer.empty();
  }

  getCurrencyPluralName(bundle: Bundle, code: string, plural: Plural): string {
    return this.Currencies(code as CurrencyType).pluralName(bundle, plural);
  }

  getNumberPattern(raw: string, negative: boolean): NumberPattern {
    return this.numberPatternCache.get(raw)[negative ? 1 : 0];
  }

  /**
   * Setup for a compact pattern. Returns the adjusted number and digits for
   * selecting the pluralized pattern.
   *
   * The extra complexity here is to deal with rounding up and selecting the
   * correct pluralized pattern for the final rounded form.
   */
  protected setupCompact(
      bundle: Bundle, n: Decimal, ctx: NumberContext, standardRaw: string,
      patternImpl: DigitsArrow, divisorImpl: DivisorArrow): [Decimal, number] {

    // Select the correct divisor based on the number of integer digits in n.
    const negative = n.isNegative();
    let ndigits = n.integerDigits();
    const ndivisor = divisorImpl(bundle, ndigits);

    const fracDigits = ctx.useSignificant ? -1 : 0;

    // Move the decimal point of n, producing q1. We always strip trailing
    // zeros on compact patterns.
    let q1 = n;
    if (ndivisor > 0) {
      q1 = q1.movePoint(-ndivisor);
    }

    // Select the initial compact pattern based on the integer digits of n.
    // The plural category doesn't matter until the final pattern is selected.
    let raw = patternImpl(bundle, ndigits, Plural.OTHER) || standardRaw;
    let pattern = this.getNumberPattern(raw, negative);

    // Adjust q1 using the compact pattern's parameters, to produce q2.
    const q1digits = q1.integerDigits();
    ctx.setCompact(pattern, q1digits, ndivisor, fracDigits);

    let q2 = ctx.adjust(q1);
    const q2digits = q2.integerDigits();

    // Check if the number rounded up, adding another integer digit.
    if (q2digits > q1digits) {
      // Select a new divisor and pattern.
      ndigits++;
      const divisor = divisorImpl(bundle, ndigits);
      raw = patternImpl(bundle, ndigits, Plural.OTHER) || standardRaw;
      pattern = this.getNumberPattern(raw, negative);

      // If divisor changed we need to divide and adjust again. We don't divide,
      // we just move the decimal point, since our Decimal type uses a radix that
      // is a power of 10. Otherwise q2 is ready for formatting.
      if (divisor > ndivisor) {
        // We shift right before we move the decimal point. This triggers rounding
        // of the number at its correct scale. Otherwise we would end up with
        // 999,999 becoming 0.999999 and half-even rounding truncating the
        // number to '0M' instead of '1M'.
        q1 = n.shiftright(divisor);
        q1 = q1.movePoint(-divisor);
        ctx.setCompact(pattern, q1.integerDigits(), divisor, fracDigits);
        q2 = ctx.adjust(q1);
      }
    }

    return [q2, ndigits];
  }

}

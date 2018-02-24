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
  ScopeArrow,
  PercentFormats
} from '@phensley/cldr-schema';

import { Decimal, RoundingMode, Part } from '../../types';
import { NumberContext } from './context';
import {
  getRoundingMode,
  CurrencyFormatOptions,
  CurrencyFormatStyle,
  CurrencySymbolWidth,
  DecimalFormatOptions,
  DecimalFormatStyle,
  NumberFormatMode,
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
      // The extra complexity here is to deal with rounding up and selecting the
      // correct pluralized pattern for the final rounded form.
      const standardRaw = this.decimalFormats.standard(bundle);
      const isShort = style === DecimalFormatStyle.SHORT;
      const negative = n.isNegative();
      const divisorImpl = isShort ? this.decimalFormats.short.decimalFormatDivisor
        : this.decimalFormats.long.decimalFormatDivisor;
      const patternImpl = isShort ? this.decimalFormats.short.decimalFormat
        : this.decimalFormats.long.decimalFormat;
      const ctx = new NumberContext(options, NumberFormatMode.SIGNIFICANT);

      // Select the correct divisor based on the number of integer digits in n.
      let ndigits = n.integerDigits();
      const ndivisor = divisorImpl(bundle, ndigits);

      // Move the decimal point of n, producing q1. We always strip trailing
      // zeros on compact patterns.
      let q1 = n;
      if (ndivisor > 0) {
        q1 = q1.movePoint(-ndivisor).stripTrailingZeros();
      }

      // Select the initial compact pattern based on the integer digits of n.
      // The plural category doesn't matter until the final pattern is selected.
      let raw = patternImpl(bundle, ndigits, Plural.OTHER) || standardRaw;
      let pattern = this.getNumberPattern(raw, negative);

      // Adjust q1 using the compact pattern's patterns, to produce q2.
      const q1digits = q1.integerDigits();
      ctx.setCompact(pattern, q1digits, ndivisor);
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
          q1 = n.movePoint(-divisor).stripTrailingZeros();
          ctx.setCompact(pattern, q1.integerDigits(), divisor);
          q2 = ctx.adjust(q1);
        }
      }
      // Compute the plural category for the final q2.
      const operands = q2.operands();
      const plural = pluralCardinal(bundle.language(), operands);

      // Select the final pluralized compact pattern based on the integer
      // digits of n and the plural category of the rounded / shifted number q2.
      raw = patternImpl(bundle, ndigits, plural) || standardRaw;
      pattern = this.getNumberPattern(raw, negative);
      return renderer.render(q2, pattern, params, '', '', options.group, ctx.minInt);
    }

    case DecimalFormatStyle.PERCENT:
    case DecimalFormatStyle.PERCENT_SCALED:
    case DecimalFormatStyle.PERMILLE:
    case DecimalFormatStyle.PERMILLE_SCALED:
    {
      // Get percent pattern.
      const raw = this.percentFormats.standard(bundle);
      const pattern = this.getNumberPattern(raw, n.isNegative());

      // Scale the number to a percent or permille form as needed.
      if (style === DecimalFormatStyle.PERCENT) {
        n = n.movePoint(2);
      } else if (style === DecimalFormatStyle.PERMILLE) {
        n = n.movePoint(3);
      }

      // Select percent or permille symbol.
      const symbol = style === DecimalFormatStyle.PERCENT || DecimalFormatStyle.PERCENT_SCALED ?
        params.symbols.percentSign : params.symbols.perMille;

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, NumberFormatMode.DEFAULT, -1);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
      return renderer.render(n, pattern, params, '', symbol, options.group, ctx.minInt);
    }

    case DecimalFormatStyle.DECIMAL:
    {
      // Get decimal pattern.
      const raw = this.decimalFormats.standard(bundle);
      const pattern = this.getNumberPattern(raw, n.isNegative());

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, NumberFormatMode.DEFAULT, -1);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
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
      const pattern = this.getNumberPattern(raw, n.isNegative());

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, NumberFormatMode.DEFAULT, fractions.digits);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
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
      const negative = n.isNegative();
      const divisorImpl = this.currencyFormats.short.standardDivisor;
      const patternImpl = this.currencyFormats.short.standard;
      const ctx = new NumberContext(options, NumberFormatMode.SIGNIFICANT_MAXFRAC, fractions.digits);
      const symbol = this.Currencies(code as CurrencyType).symbol(bundle, width);

      // Select the correct divisor based on the number of integer digits in n.
      let ndigits = n.integerDigits();
      const ndivisor = divisorImpl(bundle, ndigits);

      // Move the decimal point of n, producing q1. We always strip trailing
      // zeros on compact patterns.
      let q1 = n;
      if (ndivisor > 0) {
        q1 = q1.movePoint(-ndivisor).stripTrailingZeros();
      }

      // Select the initial compact pattern based on the integer digits of n.
      // The plural category doesn't matter until the final pattern is selected.
      let raw = patternImpl(bundle, ndigits, Plural.OTHER) || standardRaw;
      let pattern = this.getNumberPattern(raw, negative);

      // Adjust q1 using the compact pattern's parameters, to produce q2.
      const q1digits = q1.integerDigits();
      ctx.setCompact(pattern, q1digits, ndivisor);
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
          q1 = n.movePoint(-divisor).stripTrailingZeros();
          ctx.setCompact(pattern, q1.integerDigits(), divisor);
          q2 = ctx.adjust(q1);
        }
      }

      // Compute the plural category for the final q2.
      const operands = q2.operands();
      const plural = pluralCardinal(bundle.language(), operands);

      // Select the final pluralized compact pattern based on the integer
      // digits of n and the plural category of the rounded / shifted number q2.
      raw = patternImpl(bundle, ndigits, plural) || standardRaw;
      pattern = this.getNumberPattern(raw, negative);
      return renderer.render(q2, pattern, params, symbol, '', options.group, ctx.minInt);
    }

    case CurrencyFormatStyle.ACCOUNTING:
    case CurrencyFormatStyle.SYMBOL:
    {
      // Select standard or accounting pattern based on style.
      const raw = style === CurrencyFormatStyle.SYMBOL ?
        this.currencyFormats.standard(bundle) : this.currencyFormats.accounting(bundle);
      const pattern = this.getNumberPattern(raw, n.isNegative());

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, NumberFormatMode.DEFAULT, fractions.digits);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
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

  protected getNumberPattern(raw: string, negative: boolean): NumberPattern {
    return this.numberPatternCache.get(raw)[negative ? 1 : 0];
  }

}

const orDefault = <T>(v: T | undefined, alt: T): T => v === undefined ? alt : v;

import {
  CurrenciesSchema,
  CurrencyType,
  DigitsArrow,
  NumbersSchema,
  PluralType,
} from '@phensley/cldr-schema';

import {
  CurrencyFormatOptions,
  CurrencySymbolWidthType,
  DecimalFormatOptions,
} from '../../common';

import { Decimal, Part } from '../../types';
import { NumberContext } from './context';
import { NumberParams } from '../../common/private';
import { parseNumberPattern, NumberPattern } from '../../parsing/patterns/number';
import { Cache } from '../../utils/cache';
import { getCurrencyFractions } from './util';
import { Bundle } from '../../resource';
import { Internals, NumberInternals, NumberRenderer } from '../../internals/internals';
import { PartsNumberFormatter, StringNumberFormatter } from './render';

/**
 * Number internal engine singleton, shared across all locales.
 */
export class NumberInternalsImpl implements NumberInternals {

  readonly currencies: CurrenciesSchema;
  readonly numbers: NumbersSchema;

  protected readonly numberPatternCache: Cache<NumberPattern[]>;

  constructor(readonly internals: Internals, cacheSize: number = 50) {
    const schema = internals.schema;
    this.currencies = schema.Currencies;
    this.numbers = schema.Numbers;
    this.numberPatternCache = new Cache(parseNumberPattern, cacheSize);
  }

  stringRenderer(params: NumberParams): NumberRenderer<string> {
    return new StringNumberFormatter(params);
  }

  partsRenderer(params: NumberParams): NumberRenderer<Part[]> {
    return new PartsNumberFormatter(params);
  }

  getCurrencySymbol(bundle: Bundle, code: CurrencyType, width?: CurrencySymbolWidthType): string {
    const alt = width === 'narrow' ? 'narrow' : 'none';
    return this.currencies.symbol.get(bundle, alt, code) || this.currencies.symbol.get(bundle, 'none', code);
  }

  getCurrencyDisplayName(bundle: Bundle, code: CurrencyType): string {
    return this.currencies.displayName.get(bundle, code);
  }

  getCurrencyPluralName(bundle: Bundle, code: string, plural: PluralType): string {
    return this.currencies.pluralName.get(bundle, plural, code as CurrencyType);
  }

  getNumberPattern(raw: string, negative: boolean): NumberPattern {
    return this.numberPatternCache.get(raw)[negative ? 1 : 0];
  }

  formatDecimal<T>(bundle: Bundle, renderer: NumberRenderer<T>,
    n: Decimal, options: DecimalFormatOptions, params: NumberParams): [T, PluralType] {

    // TODO: abstract away pattern selection defaulting

    const style = options.style === undefined ? 'decimal' : options.style;
    let result: T;
    let plural: PluralType = 'other';

    const latnInfo = this.numbers.numberSystem.get('latn');
    const info = this.numbers.numberSystem.get(params.numberSystemName) || latnInfo;

    const decimalFormats = info.decimalFormats;
    const latnDecimalFormats = this.numbers.numberSystem.get('latn').decimalFormats;
    const standardRaw = decimalFormats.standard.get(bundle) || latnDecimalFormats.standard.get(bundle);

    switch (style) {
    case 'long':
    case 'short':
    {
      const isShort = style === 'short';
      const useLatn = decimalFormats.short.get(bundle, 'other', 4);
      const patternImpl = isShort ? (useLatn ? latnInfo.decimalFormats.short : decimalFormats.short)
        : (useLatn ? latnInfo.decimalFormats.long : decimalFormats.long);

      const ctx = new NumberContext(options, true);

      // Adjust the number using the compact pattern and divisor.
      const [q2, ndigits] = this.setupCompact(bundle, n, ctx, standardRaw, patternImpl);

      // Compute the plural category for the final q2.
      const operands = q2.operands();
      plural = this.internals.plurals.cardinal(bundle.language(), operands);

      // Select the final pluralized compact pattern based on the integer
      // digits of n and the plural category of the rounded / shifted number q2.
      let raw = patternImpl.get(bundle, plural, ndigits)[0] || standardRaw;
      if (raw === '0') {
        raw = standardRaw;
      }

      // Re-select pattern as number may have changed sign due to rounding.
      const pattern = this.getNumberPattern(raw, q2.isNegative());
      result = renderer.render(q2, pattern, '', '', '', ctx.minInt, options.group);
      break;
    }

    case 'percent':
    case 'percent-scaled':
    case 'permille':
    case 'permille-scaled':
    {
      // Get percent pattern.
      const raw = info.percentFormat.get(bundle) || latnInfo.percentFormat.get(bundle);
      let pattern = this.getNumberPattern(raw, n.isNegative());

      // Scale the number to a percent or permille form as needed.
      if (style === 'percent') {
        n = n.movePoint(2);
      } else if (style === 'permille') {
        n = n.movePoint(3);
      }

      // Select percent or permille symbol.
      const symbol = (style === 'percent' || style === 'percent-scaled') ?
        params.symbols.percentSign : params.symbols.perMille;

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, false, -1);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
      const operands = n.operands();
      plural = this.internals.plurals.cardinal(bundle.language(), operands);

      // Re-select pattern as number may have changed sign due to rounding.
      pattern = this.getNumberPattern(raw, n.isNegative());
      result = renderer.render(n, pattern, '', symbol, '', ctx.minInt, options.group);
      break;
    }

    case 'decimal':
    {
      // Get decimal pattern.
      let pattern = this.getNumberPattern(standardRaw, n.isNegative());

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, false, -1);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);
      const operands = n.operands();
      plural = this.internals.plurals.cardinal(bundle.language(), operands);

      // Re-select pattern as number may have changed sign due to rounding.
      pattern = this.getNumberPattern(standardRaw, n.isNegative());
      result = renderer.render(n, pattern, '', '', '', ctx.minInt, options.group);
      break;
    }

    default:
      result = renderer.empty();
      break;
    }

    // No valid style matched
    return [result, plural];
  }

  formatCurrency<T>(bundle: Bundle, renderer: NumberRenderer<T>,
    n: Decimal, code: string, options: CurrencyFormatOptions, params: NumberParams): T {

    const fractions = getCurrencyFractions(code);

    // TODO: display context support
    // const width = options.symbolWidth === 'narrow' ? Alt.NARROW : Alt.NONE;

    const width = options.symbolWidth === 'narrow' ? 'narrow' : 'none';
    const style = options.style === undefined ? 'symbol' : options.style;

    const latnInfo = this.numbers.numberSystem.get('latn');
    const info = this.numbers.numberSystem.get(params.numberSystemName) || latnInfo;

    const currencyFormats = info.currencyFormats;
    const latnDecimalFormats = this.numbers.numberSystem.get('latn').decimalFormats;

    const standardRaw = currencyFormats.standard.get(bundle) || latnDecimalFormats.standard.get(bundle);

    // Some locales have a special decimal symbol for certain currencies, e.g. pt-PT and PTE
    const decimal = this.currencies.decimal.get(bundle, code as CurrencyType) || '';

    switch (style) {

    case 'code':
    case 'name':
    {
      const raw = info.decimalFormats.standard.get(bundle) || latnInfo.decimalFormats.standard.get(bundle);
      let pattern = this.getNumberPattern(raw, n.isNegative());

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, false, fractions.digits);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);

      // Re-select pattern as number may have changed sign due to rounding.
      pattern = this.getNumberPattern(raw, n.isNegative());
      const num = renderer.render(n, pattern, '', '', decimal, ctx.minInt, options.group);

      // Compute plural category and select pluralized unit.
      const operands = n.operands();
      const plural = this.internals.plurals.cardinal(bundle.language(), operands);
      const unit = style === 'code' ? code : this.getCurrencyPluralName(bundle, code, plural);

      // Wrap number and unit together.
      const unitWrapper = currencyFormats.unitPattern.get(bundle, plural)
        || latnInfo.currencyFormats.unitPattern.get(bundle, plural);
      return renderer.wrap(this.internals.wrapper, unitWrapper, num, renderer.make('unit', unit));
    }

    case 'short':
    {
      // The extra complexity here is to deal with rounding up and selecting the
      // correct pluralized pattern for the final rounded form.
      const patternImpl = currencyFormats.short;

      const ctx = new NumberContext(options, true, fractions.digits);
      const symbol = this.currencies.symbol.get(bundle, width, code as CurrencyType);

      // Adjust the number using the compact pattern and divisor.
      const [q2, ndigits] = this.setupCompact(bundle, n, ctx, standardRaw, patternImpl);

      // Compute the plural category for the final q2.
      const operands = q2.operands();
      const plural = this.internals.plurals.cardinal(bundle.language(), operands);

      // Select the final pluralized compact pattern based on the integer
      // digits of n and the plural category of the rounded / shifted number q2.
      let raw = patternImpl.get(bundle, plural, ndigits)[0] || standardRaw;
      if (raw === '0') {
        raw = standardRaw;
      }

      const pattern = this.getNumberPattern(raw, q2.isNegative());
      return renderer.render(q2, pattern, symbol, '', decimal, ctx.minInt, options.group);
    }

    case 'accounting':
    case 'symbol':
    {
      // Select standard or accounting pattern based on style.
      let styleArrow = style === 'symbol' ? currencyFormats.standard : currencyFormats.accounting;
      let raw = styleArrow.get(bundle);
      if (!raw) {
        styleArrow = style === 'symbol' ? latnInfo.currencyFormats.standard : latnInfo.currencyFormats.accounting;
        raw = styleArrow.get(bundle);
      }
      let pattern = this.getNumberPattern(raw, n.isNegative());

      // Adjust number using pattern and options, then render.
      const ctx = new NumberContext(options, false, fractions.digits);
      ctx.setPattern(pattern);
      n = ctx.adjust(n);

      // Re-select pattern as number may have changed sign due to rounding.
      pattern = this.getNumberPattern(raw, n.isNegative());
      const symbol = this.currencies.symbol.get(bundle, width, code as CurrencyType);
      return renderer.render(n, pattern, symbol, '', decimal, ctx.minInt, options.group);
    }
    }

    // No valid style matched
    return renderer.empty();
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
      patternImpl: DigitsArrow<PluralType>): [Decimal, number] {

    // Select the correct divisor based on the number of integer digits in n.
    const negative = n.isNegative();
    let ndigits = n.integerDigits();

    // Select the initial compact pattern based on the integer digits of n.
    // The plural category doesn't matter until the final pattern is selected.
    let raw: string;
    let ndivisor = 0;
    [raw, ndivisor] = patternImpl.get(bundle, 'other', ndigits);
    let pattern = this.getNumberPattern(raw || standardRaw, negative);

    const fracDigits = ctx.useSignificant ? -1 : 0;

    // Move the decimal point of n, producing q1. We always strip trailing
    // zeros on compact patterns.
    let q1 = n;
    if (ndivisor > 0) {
      q1 = q1.movePoint(-ndivisor);
    }

    // Adjust q1 using the compact pattern's parameters, to produce q2.
    const q1digits = q1.integerDigits();
    ctx.setCompact(pattern, q1digits, ndivisor, fracDigits);

    let q2 = ctx.adjust(q1);
    const q2digits = q2.integerDigits();

    // Check if the number rounded up, adding another integer digit.
    if (q2digits > q1digits) {
      // Select a new divisor and pattern.
      ndigits++;

      let divisor = 0;
      [raw, divisor] = patternImpl.get(bundle, 'other', ndigits);
      pattern = this.getNumberPattern(raw || standardRaw, negative);

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

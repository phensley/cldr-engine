import { coerceDecimal, DecimalArg, DecimalFormatter, StringDecimalFormatter } from '../../types/numbers';
import { NumberSymbols } from '../../common/private';
import { Chars } from '../../types';

const isInteger = ((n: any): boolean => typeof n === 'number' && isFinite(n) && Math.floor(n) === n);

export interface NumberingSystemParams {
  readonly decimal: string;
}

export abstract class NumberingSystem {

  constructor(
    readonly name: string,
    readonly symbols: NumberSymbols,
    readonly minimumGroupingDigits: number,
    readonly primaryGroupingSize: number,
    readonly secondaryGroupingSize: number
  ) {}

  /**
   * Format a number directly to a string. This is used for things like low-level field
   * formatting for Calendars.
   */
  abstract formatString(n: DecimalArg, groupDigits?: boolean, minInt?: number): string;

  // abstract format<R>(formatter: NumberFormatter<R>, n: DecimalArg, groupDigits?: boolean, minInt?: number): R;

  // abstract formatPattern<R>(formatter: NumberFormatter<R>, pattern: NumberPattern, n: DecimalArg,
  //   groupDigits: boolean, currencySymbol: string, percentSymbol: string, minInt: number): R;
}

export class DecimalNumberingSystem extends NumberingSystem {

  constructor(
    name: string,
    readonly digits: string[],
    symbols: NumberSymbols,
    minimumGroupingDigits: number,
    primaryGroupingSize: number,
    secondaryGroupingSize: number
  ) {
    super(name, symbols, minimumGroupingDigits, primaryGroupingSize, secondaryGroupingSize);
  }

  formatString(n: DecimalArg, groupDigits?: boolean, minInt: number = 1): string {
    if (!groupDigits && isInteger(n)) {
      return this._fastFormatDecimal(String(n), minInt);
    }
    return this._formatDecimal(new StringDecimalFormatter(), n, groupDigits, minInt);
  }

  // TODO: future merging of internal number formatting code into this module

  // format<R>(formatter: NumberFormatter<R>, n: DecimalArg, groupDigits: boolean = false, minInt: number = 1): R {
  //   const f = formatter.formatter(this.symbols.decimal, groupDigits ? this.symbols.group : '');
  //   return this._formatDecimal(f, n, groupDigits, minInt);
  // }

  // formatPattern<R>(formatter: NumberFormatter<R>, pattern: NumberPattern, n: DecimalArg,
  //     groupDigits: boolean, currencySymbol: string, percentSymbol: string, minInt: number): R {

  //   return {} as R;
  // }

  protected _formatDecimal<R>(f: DecimalFormatter<R>, n: DecimalArg, groupDigits?: boolean, minInt: number = 1): R {
    const d = coerceDecimal(n);
    const group = groupDigits ? this.symbols.group : '';
    d.format(f,
      this.symbols.decimal || '.',
      group,
      minInt,
      this.minimumGroupingDigits,
      this.primaryGroupingSize,
      this.secondaryGroupingSize,
      this.digits);
    return f.render();
  }

  protected _fastFormatDecimal(n: string, minInt: number): string {
    let r = '';
    const dg = this.digits;
    const len = n.length;
    for (let i = 0; i < len; i++) {
      const c = n.charCodeAt(i);
      switch (c) {
        case Chars.DIGIT0:
        case Chars.DIGIT1:
        case Chars.DIGIT2:
        case Chars.DIGIT3:
        case Chars.DIGIT4:
        case Chars.DIGIT5:
        case Chars.DIGIT6:
        case Chars.DIGIT7:
        case Chars.DIGIT8:
        case Chars.DIGIT9:
          r += dg[c - Chars.DIGIT0];
          break;
      }
    }
    // Left pad zeros if minimum integer digits > formatted length
    let diff = minInt - r.length;
    if (diff > 0) {
      let p = '';
      while (diff-- > 0) {
        p += dg[0];
      }
      return p + r;
    }
    return r;
  }
}

const INTERNAL_SYMBOLS: NumberSymbols = {
  decimal: '.',
  group: ',',
  list: ';',
  percentSign: '%',
  plusSign: '+',
  minusSign: '-',
  exponential: 'E',
  currencyDecimal: '.',
  currencyGroup: ',',
  superscriptingExponent: '×',
  perMille: '‰',
  infinity: '∞',
  nan: 'NaN',
  timeSeparator: ':'
};

export const INTERNAL_NUMBERING = new DecimalNumberingSystem(
  'internal', '0123456789'.split(''), INTERNAL_SYMBOLS, 1, 3, 3);

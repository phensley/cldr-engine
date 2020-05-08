import { coerceDecimal, Chars, DecimalArg, DecimalFormatter, StringDecimalFormatter } from '@phensley/decimal';
import { NumberingSystem, NumberSymbols } from '../../common/private';

const isInteger = (n: any): boolean => typeof n === 'number' && isFinite(n) && Math.floor(n) === n;

/**
 * @internal
 */
export interface NumberingSystemParams {
  readonly decimal: string;
}

/**
 * @internal
 */
export class DecimalNumberingSystem extends NumberingSystem {
  constructor(
    name: string,
    readonly digits: string[],
    symbols: NumberSymbols,
    minimumGroupingDigits: number,
    primaryGroupingSize: number,
    secondaryGroupingSize: number,
  ) {
    super(name, symbols, minimumGroupingDigits, primaryGroupingSize, secondaryGroupingSize);
  }

  formatString(n: DecimalArg, groupDigits: boolean, minInt: number): string {
    if (!groupDigits && isInteger(n)) {
      return fastFormatDecimal(String(n), this.digits, minInt);
    }
    return this._formatDecimal(new StringDecimalFormatter(), n, groupDigits, minInt);
  }

  // TODO: future merging of internal number formatting code into this module

  protected _formatDecimal<R>(f: DecimalFormatter<R>, n: DecimalArg, groupDigits: boolean, minInt: number): R {
    const d = coerceDecimal(n);
    const group = groupDigits ? this.symbols.group : '';
    d.format(
      f,
      this.symbols.decimal || '.',
      group,
      minInt,
      this.minimumGroupingDigits,
      this.primaryGroupingSize,
      this.secondaryGroupingSize,
      true, // zeroScale
      this.digits,
    );
    return f.render();
  }
}

/**
 * Fast formatter for integers, no grouping, etc.
 *
 * @internal
 */
export const fastFormatDecimal = (n: string, digits: string[], minInt: number): string => {
  let r = '';
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
        r += digits[c - Chars.DIGIT0];
        break;
    }
  }
  // Left pad zeros if minimum integer digits > formatted length
  let diff = minInt - r.length;
  if (diff > 0) {
    let p = '';
    while (diff-- > 0) {
      p += digits[0];
    }
    return p + r;
  }
  return r;
};

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
  timeSeparator: ':',
};

/**
 * @internal
 */
export const INTERNAL_NUMBERING = new DecimalNumberingSystem(
  'internal',
  '0123456789'.split(''),
  INTERNAL_SYMBOLS,
  1,
  3,
  3,
);

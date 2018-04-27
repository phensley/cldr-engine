import { coerceDecimal, Decimal, DecimalArg, DecimalFormatter, StringDecimalFormatter } from '../../types/numbers';
import { decimalNumberingDigits } from './autogen.decimal';
import { NumberPattern } from '../../parsing/patterns/number';
import { NumberFormatter } from '../../internals/numbers';
import { NumberParams, NumberSymbols } from '../../common/private';

// const isInteger: (x: any) => boolean = Number.isInteger ||
//   ((n: any): boolean => typeof n === 'number' && isFinite(n) && Math.floor(n) === n);

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
      this.symbols.decimal,
      group,
      minInt,
      this.minimumGroupingDigits,
      this.primaryGroupingSize,
      this.secondaryGroupingSize,
      this.digits);
    return f.render();
  }

}

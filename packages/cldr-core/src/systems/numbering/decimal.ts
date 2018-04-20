// import { NumberSymbols } from '@phensley/cldr-schema';
import { coerceDecimal, Decimal, DecimalArg } from '../../types/numbers';
import { decimalNumberingDigits } from './autogen.decimal';

const isInteger: (x: any) => boolean = Number.isInteger ||
  ((n: any): boolean => typeof n === 'number' && isFinite(n) && Math.floor(n) === n);

export interface NumberingSystemParams {
  readonly decimal: string;
}

export interface NumberingSystem {
  format(n: DecimalArg): string;
}

export class DecimalNumberingSystem implements NumberingSystem {

  // readonly digits: string[];
  // readonly decimal: string;
  // readonly group: string;

  // constructor(
  //   readonly name: string,
  //   symbols: NumberSymbols,
  //   readonly primaryGroupingSize: number,
  //   readonly secondaryGroupingSize: number
  // ) {
  //   this.digits = decimalNumberingDigits[name] || decimalNumberingDigits.latn;
  //   this.decimal = symbol.decimal;
  // }

  format(n: DecimalArg): string {
  //   if (isInteger(n)) {
  //     // Fast path for integers.
  //     const s = String(n);
  //     for (let i = 0; i < s.length; i++) {
  //       const d = s[i];
  //     }
  //   }
  //   const dec = coerceDecimal(n);
  //   const syms = this.symbols;
  //   // return dec.format(syms.decimal,syms.group,
    return '';
  }

  // formatPattern(n: DecimalArg, group: boolean, minInt: number, priGroup?: number, secGroup?: number): string {
  //   const d = coerceDecimal(n);
  //   return d.format()
  // }
}

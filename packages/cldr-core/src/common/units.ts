import { UnitType } from '@phensley/cldr-types';
import { Decimal, MathContext } from '@phensley/decimal';

import { NumberFormatOptions, NumberFormatStyleType } from './numbers';

/**
 * @alpha
 */
export interface Quantity {
  value: number | string | Decimal;
  unit?: UnitType;
  per?: UnitType;
  times?: UnitType;
}

/**
 * @alpha
 */
export type UnitFormatStyleType =
  NumberFormatStyleType;

export type UnitLength = 'short' | 'narrow' | 'long';

/**
 * @alpha
 */
export interface UnitFormatOptions extends NumberFormatOptions {
  divisor?: number;
  style?: UnitFormatStyleType;
  length?: UnitLength;
}

/**
 * @alpha
 */
export interface UnitConvertOptions {
  ctx?: MathContext;
}

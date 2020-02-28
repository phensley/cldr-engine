import { UnitType } from '@phensley/cldr-types';
import { Decimal, MathContext } from '@phensley/decimal';

import { NumberFormatOptions, NumberFormatStyleType } from './numbers';

/**
 * @public
 */
export interface Quantity {
  value: number | string | Decimal;
  unit?: UnitType;
  per?: UnitType;
  times?: UnitType;
}

/**
 * @public
 */
export type UnitFormatStyleType =
  NumberFormatStyleType;

/**
 * @public
 */
export type UnitLength = 'short' | 'narrow' | 'long';

/**
 * @public
 */
export interface UnitFormatOptions extends NumberFormatOptions {
  divisor?: number;
  style?: UnitFormatStyleType;
  length?: UnitLength;
}

/**
 * @public
 */
export interface UnitConvertOptions {
  ctx?: MathContext;
}

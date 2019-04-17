import { UnitType } from '@phensley/cldr-schema';
import { Decimal } from '@phensley/decimal';

import { NumberFormatOptions, NumberFormatStyleType } from './numbers';

/**
 * @alpha
 */
export interface Quantity {
  value: number | string | Decimal;
  unit?: UnitType;
  per?: UnitType;
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
  style?: UnitFormatStyleType;
  length?: UnitLength;
}

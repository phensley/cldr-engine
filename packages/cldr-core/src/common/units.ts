import { UnitType } from '@phensley/cldr-schema';
import { DecimalFormatOptions } from './numbers';
import { Decimal } from '../types/numbers';

/**
 * @alpha
 */
export interface Quantity {
  value: number | string | Decimal;
  unit?: UnitType;
  per?: UnitType;
}

export type UnitLength = 'short' | 'narrow' | 'long';

/**
 * @alpha
 */
export interface UnitFormatOptions extends DecimalFormatOptions {
  length?: UnitLength;
}

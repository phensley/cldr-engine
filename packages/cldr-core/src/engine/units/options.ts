import { UnitType } from '@phensley/cldr-schema';
import { DecimalFormatOptions } from '../numbers';
import { Decimal } from '../../types/numbers';

export interface Quantity {
  value: number | string | Decimal;
  unit?: UnitType;
}

export type UnitLength = 'short' | 'narrow' | 'long';

export interface UnitFormatOptions extends DecimalFormatOptions {
  length?: UnitLength;
}

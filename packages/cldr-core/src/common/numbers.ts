import { NumberSystemName } from '@phensley/cldr-schema';
import { RoundingModeType } from '../types';

export type NumberSystemType =
  'default' | 'native' | 'finance' | 'traditional' | NumberSystemName;

export interface NumberFormatOptions {
  nu?: NumberSystemType;
  round?: RoundingModeType;
  group?: boolean;
  minimumIntegerDigits?: number;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  maximumSignificantDigits?: number;
  minimumSignificantDigits?: number;
}

export type DecimalFormatStyleType =
  'decimal' | 'percent' | 'percent-scaled' | 'permille' | 'permille-scaled' | 'short' | 'long';

export type CurrencyFormatStyleType =
  'symbol' | 'accounting' | 'code' | 'name' | 'short';

  export type CurrencySymbolWidthType = 'default' | 'narrow';

/**
 * @alpha
 */
export interface DecimalFormatOptions extends NumberFormatOptions {
  style?: DecimalFormatStyleType;
}

/**
 * @alpha
 */
export interface CurrencyFormatOptions extends NumberFormatOptions {
  style?: CurrencyFormatStyleType;
  symbolWidth?: CurrencySymbolWidthType;
}

import { NumberSystemCategory, NumberSystemName } from '@phensley/cldr-schema';
import { RoundingModeType } from '@phensley/decimal';

export type NumberSystemType = NumberSystemCategory | NumberSystemName;

export type NumberFormatErrorType = 'nan' | 'infinity';

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
  'decimal' | 'percent' | 'percent-scaled' | 'permille' | 'permille-scaled' | 'short' | 'long' | 'scientific';

export type CurrencyFormatStyleType =
  'symbol' | 'accounting' | 'code' | 'name' | 'short';

  export type CurrencySymbolWidthType = 'default' | 'narrow';

/**
 * @alpha
 */
export interface DecimalFormatOptions extends NumberFormatOptions {
  style?: DecimalFormatStyleType;
  errors?: NumberFormatErrorType[];
}

/**
 * @alpha
 */
export interface CurrencyFormatOptions extends NumberFormatOptions {
  cash?: boolean;
  style?: CurrencyFormatStyleType;
  symbolWidth?: CurrencySymbolWidthType;
}

/**
 * Information on rounding and number of decimal digits for a given currency.
 */
export interface CurrencyFractions {
  digits: number;
  rounding: number;
  cashDigits: number;
  cashRounding: number;
}

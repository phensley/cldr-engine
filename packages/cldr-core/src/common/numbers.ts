import { ContextType, NumberSystemCategory, NumberSystemName } from '@phensley/cldr-types';
import { RoundingModeType } from '@phensley/decimal';

/**
 * @alpha
 */
export type NumberSystemType = NumberSystemCategory | NumberSystemName;

/**
 * @alpha
 */
export type NumberFormatErrorType = 'nan' | 'infinity';

/**
 * @alpha
 */
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

export type NumberFormatStyleType = 'decimal' | 'short' | 'long' | 'scientific';

/**
 * @alpha
 */
export type DecimalFormatStyleType =
  NumberFormatStyleType | 'percent' | 'percent-scaled' | 'permille' | 'permille-scaled';

/**
 * @alpha
 */
export type CurrencyFormatStyleType =
  'symbol' | 'accounting' | 'code' | 'name' | 'short';

/**
 * @alpha
 */
export type CurrencySymbolWidthType = 'default' | 'narrow';

/**
 * @alpha
 */
export interface DecimalFormatOptions extends NumberFormatOptions {
  divisor?: number;
  style?: DecimalFormatStyleType;
  errors?: NumberFormatErrorType[];
}

/**
 * @alpha
 */
export interface DecimalAdjustOptions {
  round?: RoundingModeType;
  minimumIntegerDigits?: number;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  maximumSignificantDigits?: number;
  minimumSignificantDigits?: number;
}

/**
 * @alpha
 */
export interface CurrencyFormatOptions extends NumberFormatOptions {
  divisor?: number;
  cash?: boolean;
  style?: CurrencyFormatStyleType;
  symbolWidth?: CurrencySymbolWidthType;
}

/**
 * @alpha
 */
export interface RuleBasedFormatOptions {
  rule?: string;
  context?: ContextType;
  round?: RoundingModeType;
  minimumIntegerDigits?: number;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  maximumSignificantDigits?: number;
  minimumSignificantDigits?: number;
}

/**
 * Information on rounding and number of decimal digits for a given currency.
 *
 * @alpha
 */
export interface CurrencyFractions {
  digits: number;
  rounding: number;
  cashDigits: number;
  cashRounding: number;
}

import { ContextType, NumberSystemCategory, NumberSystemName } from '@phensley/cldr-types';
import { RoundingModeType } from '@phensley/decimal';

/**
 * @public
 */
export type NumberSystemType = NumberSystemCategory | NumberSystemName;

/**
 * @public
 */
export type NumberFormatErrorType = 'nan' | 'infinity';

/**
 * @public
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

  /**
   * Values whose fraction part is all zeros will format as a whole number,
   * e.g. '10.00' formats as '$10'
   */
  trimZeroFractions?: boolean;
}

/**
 * @public
 */
export type NumberFormatStyleType = 'decimal' | 'short' | 'long' | 'scientific';

/**
 * @public
 */
export type DecimalFormatStyleType =
  NumberFormatStyleType | 'percent' | 'percent-scaled' | 'permille' | 'permille-scaled';

/**
 * @public
 */
export type CurrencyFormatStyleType =
  'symbol' | 'accounting' | 'code' | 'name' | 'short';

/**
 * @public
 */
export type CurrencySymbolWidthType = 'default' | 'narrow';

/**
 * @public
 */
export interface DecimalFormatOptions extends NumberFormatOptions {
  divisor?: number;
  negativeZero?: boolean;
  style?: DecimalFormatStyleType;
  errors?: NumberFormatErrorType[];
}

/**
 * @public
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
 * @public
 */
export interface CurrencyFormatOptions extends NumberFormatOptions {
  divisor?: number;
  cash?: boolean;
  style?: CurrencyFormatStyleType;
  symbolWidth?: CurrencySymbolWidthType;
}

/**
 * @public
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
 * @public
 */
export interface CurrencyFractions {
  digits: number;
  rounding: number;
  cashDigits: number;
  cashRounding: number;
}

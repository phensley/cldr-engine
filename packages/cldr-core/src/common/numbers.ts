import { NumberSystemName } from '@phensley/cldr-schema';
import { RoundingMode } from '../types/numbers';

export type NumberSystemType =
  'default' | 'native' | 'finance' | 'traditional' | NumberSystemName;

export type RoundingModeType =
  'up' | 'down' | 'ceiling' | 'floor' | 'half-up' | 'half-down' | 'half-even' | '05up' | 'truncate';

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

export const enum DecimalFormatStyle {
  DECIMAL = 'decimal',
  PERCENT = 'percent',
  PERCENT_SCALED = 'percent-scaled',
  PERMILLE = 'permille',
  PERMILLE_SCALED = 'permille-scaled',
  SHORT = 'short',
  LONG = 'long'
}

export const enum CurrencyFormatStyle {
  SYMBOL = 'symbol',
  ACCOUNTING = 'accounting',
  CODE = 'code',
  NAME = 'name',
  SHORT = 'short'
}

export enum CurrencySymbolWidth {
  DEFAULT = 'default',
  NARROW = 'narrow'
}

export type CurrencySymbolWidthType = 'default' | 'narrow';

export type DecimalFormatStyleType =
  'decimal' | 'percent' | 'percent-scaled' | 'permille' | 'permille-scaled' | 'short' | 'long';

export type CurrencyFormatStyleType =
  'symbol' | 'accounting' | 'code' | 'name' | 'short';

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

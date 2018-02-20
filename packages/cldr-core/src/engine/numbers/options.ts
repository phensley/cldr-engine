import { RoundingMode } from '../../types/numbers';

export enum NumberFormatMode {
  DEFAULT = 0,
  SIGNIFICANT = 1,
  SIGNIFICANT_MAXFRAC = 2
}

export interface NumberFormatOptions {
  formatMode?: NumberFormatMode;
  round?: RoundingMode;
  group?: boolean;
  minIntDigits?: number;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  maximumSignificantDigits?: number;
  minimumSignificantDigits?: number;
}

export enum DecimalFormatStyle {
  DECIMAL = 'decimal',
  PERCENT = 'percent',
  PERCENT_SCALED = 'percent-scaled',
  PERMILLE = 'permille',
  PERMILLE_SCALED = 'permille-scaled',
  SHORT = 'short',
  LONG = 'long'
}

export interface DecimalFormatOptions extends NumberFormatOptions {
  style?: DecimalFormatStyle;
}

export enum CurrencyFormatStyle {
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

export interface CurrencyFormatOptions extends NumberFormatOptions {
  style?: CurrencyFormatStyle;
  symbolWidth?: CurrencySymbolWidth;
}

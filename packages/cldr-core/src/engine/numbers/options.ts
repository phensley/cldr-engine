import { CurrencySpacing, NumberSymbols } from '@phensley/cldr-schema';
import { RoundingMode } from '../../types/numbers';

export interface NumberParams {
  symbols: NumberSymbols;
  minimumGroupingDigits: number;
  beforeCurrency: CurrencySpacing;
  afterCurrency: CurrencySpacing;
}

export enum NumberFormatMode {
  DEFAULT = 'default',
  SIGNIFICANT = 'significant',
  SIGNIFICANT_MAXFRAC = 'significant-maxfrac'
}

export type NumberFormatModeType = 'default' | 'significant' | 'significant-maxfrac';

export type RoundingModeType =
  'up' | 'down' | 'ceiling' | 'floor' | 'half-up' | 'half-down' | 'half-even' | '05up' | 'truncate';

export const getRoundingMode = (mode: RoundingModeType | undefined, alt: RoundingModeType): RoundingMode => {
  switch (mode === undefined ? alt : mode) {
  case 'up':
    return RoundingMode.UP;
  case 'down':
    return RoundingMode.DOWN;
  case 'ceiling':
    return RoundingMode.CEILING;
  case 'floor':
    return RoundingMode.FLOOR;
  case 'half-up':
    return RoundingMode.HALF_UP;
  case 'half-down':
    return RoundingMode.HALF_DOWN;
  case '05up':
    return RoundingMode.ZERO_FIVE_UP;
  case 'truncate':
    return RoundingMode.TRUNCATE;
  case 'half-even':
  default:
    return RoundingMode.HALF_EVEN;
  }
};

export interface NumberFormatOptions {
  formatMode?: NumberFormatModeType;
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

export interface DecimalFormatOptions extends NumberFormatOptions {
  style?: DecimalFormatStyleType;
}

export interface CurrencyFormatOptions extends NumberFormatOptions {
  style?: CurrencyFormatStyleType;
  symbolWidth?: CurrencySymbolWidth;
}

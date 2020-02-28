import { CurrencySpacingPattern, CurrencySpacingPos, NumberSymbolType, NumberSystemName } from '@phensley/cldr-types';

/**
 * @internal
 */
export type CurrencySpacing = { [P in CurrencySpacingPos]: { [Q in CurrencySpacingPattern]: string } };

/**
 * @internal
 */
export type NumberSymbols = { [P in NumberSymbolType]: string };

/**
 * @internal
 */
export interface NumberParams {
  numberSystemName: NumberSystemName;
  digits: string[];
  latinDigits: string[];
  symbols: NumberSymbols;
  minimumGroupingDigits: number;
  primaryGroupingSize: number;
  secondaryGroupingSize: number;
  beforeCurrency: CurrencySpacing;
  afterCurrency: CurrencySpacing;
}

/**
 * @internal
 */
export interface NumberFormatRequest {
  // readonly numberSystem:
}
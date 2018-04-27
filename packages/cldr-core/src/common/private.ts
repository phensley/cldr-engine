import { CurrencySpacingPattern, CurrencySpacingPos, NumberSymbolType, NumberSystemName } from '@phensley/cldr-schema';
import { NumberingSystem } from '../systems';
import { DateTimeNode } from '../parsing/patterns/date';

// TODO: move these

export type CurrencySpacingPatterns = { [Q in CurrencySpacingPattern]: string };
export type CurrencySpacing = { [P in CurrencySpacingPos]: CurrencySpacingPatterns };
export type NumberSymbols =  { [P in NumberSymbolType]: string };

/**
 * @internal
 */
export interface NumberParams {
  numberSystemName: NumberSystemName;
  system: NumberingSystem;
  latnSystem: NumberingSystem;
  digits: string[];
  latinDigits: string[];
  symbols: NumberSymbols;
  minimumGroupingDigits: number;
  primaryGroupingSize: number;
  secondaryGroupingSize: number;
  currencySpacing: CurrencySpacing;
}

/**
 * @internal
 */
export interface DateFormatRequest {
  wrapper: string;
  date?: DateTimeNode[];
  time?: DateTimeNode[];
  params: NumberParams;
}

/**
 * @internal
 */
export interface DateIntervalFormatRequest {
  date?: DateTimeNode[];
  range?: DateTimeNode[];
  skeleton?: string;
  params: NumberParams;

  // Wrapper for fallback
  wrapper: string;
}

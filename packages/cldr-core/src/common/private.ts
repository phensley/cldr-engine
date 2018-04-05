import { CurrencySpacing, NumberSymbols, NumberSystemName } from '@phensley/cldr-schema';
import { NumberSystem } from '../systems';
import { DateTimeNode } from '../parsing/patterns/date';

/**
 * @internal
 */
export interface NumberParams {
  numberSystemName: NumberSystemName;
  digits: string[];
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

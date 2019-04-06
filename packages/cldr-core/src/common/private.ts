import {
  ContextTransformFieldType,
  CurrencySpacingPattern,
  CurrencySpacingPos,
  NumberSymbolType,
  NumberSystemName,
} from '@phensley/cldr-schema';
import { DecimalArg } from '@phensley/decimal';

import { DateTimeNode } from '../parsing/date';

// TODO: move these

export type CurrencySpacingPatterns = { [Q in CurrencySpacingPattern]: string };
export type CurrencySpacing = { [P in CurrencySpacingPos]: CurrencySpacingPatterns };
export type NumberSymbols =  { [P in NumberSymbolType]: string };

export abstract class NumberingSystem {

  constructor(
    readonly name: string,
    readonly symbols: NumberSymbols,
    readonly minimumGroupingDigits: number,
    readonly primaryGroupingSize: number,
    readonly secondaryGroupingSize: number
  ) {}

  /**
   * Format a number directly to a string. This is used for things like low-level field
   * formatting for Calendars.
   */
  abstract formatString(n: DecimalArg, groupDigits?: boolean, minInt?: number): string;

  // abstract format<R>(formatter: NumberFormatter<R>, n: DecimalArg, groupDigits?: boolean, minInt?: number): R;

  // abstract formatPattern<R>(formatter: NumberFormatter<R>, pattern: NumberPattern, n: DecimalArg,
  //   groupDigits: boolean, currencySymbol: string, percentSymbol: string, minInt: number): R;
}

/**
 * @internal
 */
export type ContextTransformInfo = {
  [x in ContextTransformFieldType]: string;
};

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

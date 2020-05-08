import {
  ContextTransformFieldType,
  CurrencySpacingPattern,
  CurrencySpacingPos,
  NumberSymbolType,
  NumberSystemName,
} from '@phensley/cldr-types';

import { DecimalArg } from '@phensley/decimal';

import { DateTimeNode } from '../parsing/date';

// TODO: move these

/**
 * @internal
 */
export type CurrencySpacingPatterns = { [Q in CurrencySpacingPattern]: string };

/**
 * @internal
 */
export type CurrencySpacing = { [P in CurrencySpacingPos]: CurrencySpacingPatterns };

/**
 * @internal
 */
export type NumberSymbols = { [P in NumberSymbolType]: string };

/**
 * @internal
 */
export abstract class NumberingSystem {
  constructor(
    readonly name: string,
    readonly symbols: NumberSymbols,
    readonly minimumGroupingDigits: number,
    readonly primaryGroupingSize: number,
    readonly secondaryGroupingSize: number,
  ) {}

  /**
   * Format a number directly to a string. This is used for things like low-level field
   * formatting for Calendars.
   */
  abstract formatString(n: DecimalArg, groupDigits: boolean, minInt: number): string;
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

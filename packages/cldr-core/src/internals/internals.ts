import {
  Alt,
  CurrencyInfo,
  CurrencyType,
  DateFieldType,
  DateTimePatternFieldType,
  IntervalFormatType,
  Plural,
  Schema,
  UnitInfo,
  UnitType
} from '@phensley/cldr-schema';

import {
  CurrencyFormatOptions,
  DateFormatOptions,
  DecimalFormatOptions,
  NumberSystemType,
  Quantity,
  RelativeTimeFormatOptions,
  UnitFormatOptions
} from '../common';

import { NumberParams } from '../common/private';
import { Bundle } from '../resource';
import { NumberPattern } from '../parsing/patterns/number';
import { Decimal, DecimalArg, NumberOperands, Part, ZonedDateTime } from '../types';

export interface CalendarInternals {
  formatDate(bundle: Bundle, date: ZonedDateTime, options: DateFormatOptions): string;
  formatDateToParts(bundle: Bundle, date: ZonedDateTime, options: DateFormatOptions): Part[];
  formatDateInterval(bundle: Bundle, start: ZonedDateTime, end: ZonedDateTime, pattern: string): string;
  formatDateIntervalToParts(bundle: Bundle, start: ZonedDateTime, end: ZonedDateTime, pattern: string): Part[];
  formatDateRaw(bundle: Bundle, date: ZonedDateTime, pattern: string): string;
  formatDateRawToParts(bundle: Bundle, date: ZonedDateTime, pattern: string): Part[];
  intervalFormats(bundle: Bundle, skeleton: IntervalFormatType, field: DateTimePatternFieldType): string;
}

export interface DateFieldInternals {
  formatRelativeTime(bundle: Bundle, value: DecimalArg, field: DateFieldType,
    options: RelativeTimeFormatOptions): string;
}

export interface GeneralInternals {
  characterOrder(bundle: Bundle): string;
  lineOrder(bundle: Bundle): string;
  getScriptDisplayName(bundle: Bundle, code: string): string;
  getRegionDisplayName(bundle: Bundle, code: string, alt?: Alt): string;
}

export interface NumberRenderer<T> {
    /**
   * Render a number pattern to final form T.
   */
  render(n: Decimal, pattern: NumberPattern, params: NumberParams,
    currency: string, percent: string, group: boolean | undefined, minInt: number): T;

  /**
   * Render a wrapper pattern to final form T using the given args.
   */
  wrap(internal: WrapperInternals, pattern: string, ...args: T[]): T;

  /**
   * Construct a part of type T from a type and value.
   */
  part(type: string, value: string): T;

  /**
   * Return the empty value for T.
   */
  empty(): T;
}

export interface NumberInternals {
  stringRenderer(): NumberRenderer<string>;
  partsRenderer(): NumberRenderer<Part[]>;
  formatDecimal<T>(bundle: Bundle, renderer: NumberRenderer<T>, n: Decimal,
      options: DecimalFormatOptions, params: NumberParams): [T, number];
  formatCurrency<T>(bundle: Bundle, renderer: NumberRenderer<T>, n: Decimal, code: string,
    options: CurrencyFormatOptions, params: NumberParams): T;
  getCurrency(code: CurrencyType): CurrencyInfo;
  getCurrencyPluralName(bundle: Bundle, code: string, plural: Plural): string;
  // getNumberParams(numberSystem?: NumberSystemType): NumberParams;
  getNumberPattern(raw: string, negative: boolean): NumberPattern;
}

export interface PluralInternals {
  cardinal(language: string, operands: NumberOperands): number;
  ordinal(language: string, operands: NumberOperands): number;
}

export interface UnitInternals {
  getDisplayName(bundle: Bundle, name: UnitType, length: string): string;
  format<T>(bundle: Bundle, renderer: NumberRenderer<T>, q: Quantity,
    options: UnitFormatOptions, params: NumberParams): T;
  getUnitInfo(bundle: Bundle, name: UnitType, length: string): UnitInfo;
}

export interface WrapperInternals {
  format(format: string, args: string[]): string;
  formatParts(format: string, args: Part[][]): Part[];
}

/**
 * Unified interface for accessing internal functionality.
 */
export interface Internals {
  readonly calendars: CalendarInternals;
  readonly dateFields: DateFieldInternals;
  readonly general: GeneralInternals;
  readonly numbers: NumberInternals;
  readonly plurals: PluralInternals;
  readonly schema: Schema;
  readonly units: UnitInternals;
  readonly wrapper: WrapperInternals;
}

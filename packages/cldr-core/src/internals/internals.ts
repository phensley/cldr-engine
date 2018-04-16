import {
  Alt,
  AltType,
  CurrencyType,
  DateFieldType,
  DateTimePatternFieldType,
  DayPeriodType,
  PluralType,
  Schema,
  UnitInfo,
  UnitType,
} from '@phensley/cldr-schema';

import {
  CurrencyFormatOptions,
  CurrencySymbolWidthType,
  DecimalFormatOptions,
  ListPatternType,
  NumberSystemType,
  Quantity,
  RelativeTimeFormatOptions,
  UnitFormatOptions,
} from '../common';

import { DateFormatRequest, NumberParams, DateIntervalFormatRequest } from '../common/private';
import { Bundle } from '../resource';
import { DateTimeNode, parseDatePattern } from '../parsing/patterns/date';
import { NumberPattern } from '../parsing/patterns/number';
import { WrapperNode } from '../parsing/patterns/wrapper';
import { CalendarDate, CalendarType } from '../systems/calendars';
import { CalendarPatterns } from './calendars/patterns';
import { CalendarContext, CalendarFormatter } from './calendars/formatter';
import { Renderer } from './calendars/render';
import { Decimal, DecimalArg, NumberOperands, Part } from '../types';

export interface CalendarInternals {
  getCalendarFormatter(type: CalendarType): CalendarFormatter<CalendarDate>;
  flexDayPeriod(bundle: Bundle, minutes: number): DayPeriodType | undefined;
  parseDatePattern(raw: string): DateTimeNode[];
  getHourPattern(raw: string, negative: boolean): DateTimeNode[];
  weekFirstDay(region: string): number;
  weekMinDays(region: string): number;
  selectCalendar(bundle: Bundle, ca?: CalendarType): CalendarType;
  formatDateTime<R>(
    calendar: CalendarType, ctx: CalendarContext<CalendarDate>, renderer: Renderer<R>,
    date?: DateTimeNode[], time?: DateTimeNode[], wrapper?: string): R;
  formatInterval<R>(calendar: CalendarType, bundle: Bundle, params: NumberParams, renderer: Renderer<R>,
      start: CalendarDate, end: CalendarDate, pattern: DateTimeNode[]): R;
}

export interface DateFieldInternals {
  formatRelativeTime(bundle: Bundle, value: DecimalArg, field: DateFieldType,
    options: RelativeTimeFormatOptions): string;
}

export interface GeneralInternals {
  characterOrder(bundle: Bundle): string;
  lineOrder(bundle: Bundle): string;
  formatList(bundle: Bundle, items: string[], type: ListPatternType): string;
  formatListToParts(bundle: Bundle, items: string[], type: ListPatternType): Part[];
  formatListToPartsImpl(bundle: Bundle, items: Part[][], type: ListPatternType): Part[];
  getScriptDisplayName(bundle: Bundle, code: string): string;
  getRegionDisplayName(bundle: Bundle, code: string, alt?: AltType): string;
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
    options: DecimalFormatOptions, params: NumberParams): [T, PluralType];
  formatCurrency<T>(bundle: Bundle, renderer: NumberRenderer<T>, n: Decimal, code: string,
    options: CurrencyFormatOptions, params: NumberParams): T;
  // getCurrency(code: CurrencyType): CurrencyInfo;
  getCurrencySymbol(bundle: Bundle, code: CurrencyType, width?: CurrencySymbolWidthType): string;
  getCurrencyDisplayName(bundle: Bundle, code: CurrencyType): string;
  getCurrencyPluralName(bundle: Bundle, code: string, plural: PluralType): string;
  getNumberPattern(raw: string, negative: boolean): NumberPattern;
}

export interface PluralInternals {
  cardinal(language: string, operands: NumberOperands): PluralType;
  ordinal(language: string, operands: NumberOperands): PluralType;
}

export interface UnitInternals {
  getDisplayName(bundle: Bundle, name: UnitType, length: string): string;
  format<T>(bundle: Bundle, renderer: NumberRenderer<T>, q: Quantity,
    options: UnitFormatOptions, params: NumberParams): T;
  getUnitInfo(length: string): UnitInfo;
}

export interface WrapperInternals {
  format(format: string, args: string[]): string;
  formatParts(format: string, args: Part[][]): Part[];
  parseWrapper(format: string): WrapperNode[];
}

/**
 * Unified interface for accessing internal functionality.
 */
export interface Internals {
  // readonly calendarsold: CalendarInternalsOld;

  readonly calendars: CalendarInternals;
  readonly dateFields: DateFieldInternals;
  readonly general: GeneralInternals;
  readonly numbers: NumberInternals;
  readonly plurals: PluralInternals;
  readonly schema: Schema;
  readonly units: UnitInternals;
  readonly wrapper: WrapperInternals;
}

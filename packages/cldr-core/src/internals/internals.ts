import {
  ContextTransformFieldType,
  ContextType,
  CurrencyType,
  DateFieldType,
  DayPeriodType,
  KeyIndexMap,
  PluralType,
  Schema,
  SchemaConfig,
  UnitInfo,
  UnitType,
} from '@phensley/cldr-schema';
import { Decimal, DecimalArg, Part } from '@phensley/decimal';

import {
  CurrencyFormatOptions,
  CurrencySymbolWidthType,
  DecimalAdjustOptions,
  DecimalFormatOptions,
  ListPatternType,
  Quantity,
  RelativeTimeFormatOptions,
  UnitFormatOptions
} from '../common';

import { CalendarDate, CalendarType } from '../systems/calendars';
import { ContextTransformInfo, NumberParams } from '../common/private';
import { DateTimeNode } from '../parsing/date';
import { NumberPattern } from '../parsing/number';
import { WrapperNode } from '../parsing/wrapper';
import { Bundle } from '../resource';
import { CalendarContext, CalendarFormatter } from './calendars/formatter';
import { AbstractValue } from '../utils/render';

export interface CalendarInternals {
  getCalendarFormatter(type: CalendarType): CalendarFormatter<CalendarDate>;
  flexDayPeriod(bundle: Bundle, minutes: number): DayPeriodType | undefined;
  parseDatePattern(raw: string): DateTimeNode[];
  getHourPattern(raw: string, negative: boolean): DateTimeNode[];
  weekFirstDay(region: string): number;
  weekMinDays(region: string): number;
  selectCalendar(bundle: Bundle, ca?: CalendarType): CalendarType;

  formatDateTime<R>(
    calendar: CalendarType, ctx: CalendarContext<CalendarDate>, value: AbstractValue<R>,
    date?: DateTimeNode[], time?: DateTimeNode[], wrapper?: string): R;

  formatInterval<R>(calendar: CalendarType, ctx: CalendarContext<CalendarDate>,
    value: AbstractValue<R>, end: CalendarDate, pattern: DateTimeNode[]): R;
}

export interface DateFieldInternals {
  // formatRelativeTime(bundle: Bundle, start: CalendarDate, end: CalendarDate,
  //   options: RelativeTimeFormatOptions, params: NumberParams): string;

  formatRelativeTimeField(bundle: Bundle, value: DecimalArg, field: DateFieldType,
    options: RelativeTimeFormatOptions, params: NumberParams,
    transform: ContextTransformInfo): string;
}

export interface GeneralInternals {
  characterOrder(bundle: Bundle): string;
  lineOrder(bundle: Bundle): string;
  contextTransform(value: string, info: ContextTransformInfo,
    context?: ContextType, field?: ContextTransformFieldType): string;
  formatList(bundle: Bundle, items: string[], type: ListPatternType): string;
  formatListToParts(bundle: Bundle, items: string[], type: ListPatternType): Part[];
  formatListImpl<R>(bundle: Bundle, value: AbstractValue<R>, items: R[], type: ListPatternType): R;
  formatWrapper(format: string, args: string[]): string;
  parseWrapper(raw: string): WrapperNode[];
}

export interface NumberInternals {
  adjustDecimal(num: DecimalArg, options?: DecimalAdjustOptions): Decimal;
  stringRenderer(params: NumberParams): NumberRenderer<string>;
  partsRenderer(params: NumberParams): NumberRenderer<Part[]>;

  formatDecimal<T>(bundle: Bundle, renderer: NumberRenderer<T>, n: Decimal,
    options: DecimalFormatOptions, params: NumberParams): [T, PluralType];

  formatCurrency<T>(bundle: Bundle, renderer: NumberRenderer<T>, n: Decimal, code: string,
    options: CurrencyFormatOptions, params: NumberParams): T;

  getCurrencySymbol(bundle: Bundle, code: CurrencyType, width?: CurrencySymbolWidthType): string;
  getCurrencyDisplayName(bundle: Bundle, code: CurrencyType): string;
  getCurrencyPluralName(bundle: Bundle, code: string, plural: PluralType): string;
  getNumberPattern(raw: string, negative: boolean): NumberPattern;
}

export interface UnitInternals {
  getDisplayName(bundle: Bundle, name: UnitType, length: string): string;
  getUnitInfo(length: string): UnitInfo;

  format<T>(bundle: Bundle, renderer: NumberRenderer<T>, q: Quantity,
    options: UnitFormatOptions, params: NumberParams): T;
}

export interface NumberRenderer<R> {
  empty(): R;
  make(type: string, value: string): R;
  render(n: Decimal, pattern: NumberPattern, currencySymbol: string, percentSymbol: string,
    decimalSymbol: string, minInt: number, grouping?: boolean,
    exponent?: number): R;
  wrap(internal: GeneralInternals, raw: string, ...args: R[]): R;
}

/**
 * Unified interface for accessing internal functionality.
 */
export interface Internals {
  readonly config: SchemaConfig;
  readonly indices: KeyIndexMap;
  readonly checksum: string;
  readonly calendars: CalendarInternals;
  readonly dateFields: DateFieldInternals;
  readonly general: GeneralInternals;
  readonly numbers: NumberInternals;
  readonly schema: Schema;
  readonly units: UnitInternals;
}

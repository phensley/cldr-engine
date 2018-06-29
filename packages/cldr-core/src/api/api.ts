import {
  CharacterOrderType,
  CurrencyType,
  DateFieldType,
  DateTimePatternFieldType,
  LineOrderType,
  RegionIdType,
  ScriptIdType,
  UnitType,
} from '@phensley/cldr-schema';

import {
  CurrencyFormatOptions,
  CurrencyFractions,
  CurrencySymbolWidthType,
  DateFormatOptions,
  DateIntervalFormatOptions,
  DateRawFormatOptions,
  DecimalFormatOptions,
  ListPatternType,
  Quantity,
  RelativeTimeFormatOptions,
  UnitFormatOptions,
  UnitLength,
  UnixEpochTime
} from '../common';

import {
  BuddhistDate,
  CalendarDate,
  CalendarType,
  GregorianDate,
  ISO8601Date,
  JapaneseDate,
  PersianDate,
} from '../systems/calendars';

import { DecimalArg, Part } from '../types';

/**
 * Calendar, date and time functions.
 *
 * @alpha
 */
export interface Calendars {

  dayPeriods(type?: CalendarType): { [x: string]: string };
  months(type?: CalendarType): { [x: string]: string };
  quarters(type?: CalendarType): { [x: string]: string };
  weekdays(type?: CalendarType): { [x: string]: string };

  newBuddhistDate(epoch: number, zoneId: string): BuddhistDate;
  newGregorianDate(epoch: number, zoneId: string): GregorianDate;
  newISO8601Date(epoch: number, zoneId: string): ISO8601Date;
  newJapaneseDate(epoch: number, zoneId: string): JapaneseDate;
  newPersianDate(epoch: number, zoneId: string): PersianDate;

  toBuddhistDate(date: BuddhistDate | UnixEpochTime): BuddhistDate;
  toGregorianDate(date: CalendarDate | UnixEpochTime): GregorianDate;
  toISO8601Date(date: CalendarDate | UnixEpochTime): ISO8601Date;
  toJapaneseDate(date: CalendarDate | UnixEpochTime): JapaneseDate;
  toPersianDate(date: CalendarDate | UnixEpochTime): PersianDate;

  fieldOfGreatestDifference(a: CalendarDate, b: CalendarDate): DateTimePatternFieldType;

  /**
   * Formats a date-time value to string.
   */
  formatDate(date: CalendarDate | UnixEpochTime, options?: DateFormatOptions): string;

  /**
   * Formats a date-time value to an array of parts.
   */
  formatDateToParts(date: CalendarDate | UnixEpochTime, options?: DateFormatOptions): Part[];

  /**
   * Formats a date-time interval for the given skeleton to string.
   */
  formatDateInterval(start: CalendarDate | UnixEpochTime, end: CalendarDate | UnixEpochTime,
    options?: DateIntervalFormatOptions): string;

  /**
   * Formats a date-time interval for the given skeleton to an array of parts.
   */
  formatDateIntervalToParts(start: CalendarDate | UnixEpochTime, end: CalendarDate | UnixEpochTime,
    options?: DateIntervalFormatOptions): Part[];

  /**
   * Formats a relative time field to string.
   */
  formatRelativeTimeField(value: DecimalArg, field: DateFieldType, options?: RelativeTimeFormatOptions): string;

    /**
   * Formats a date-time value to string using a raw date-time pattern.
   *
   * Warning: You should not use this for general formatting.
   */
  formatDateRaw(date: CalendarDate | UnixEpochTime, options?: DateRawFormatOptions): string;

  /**
   * Formats a date-time value to an array of parts using a raw date-time pattern.
   *
   * Warning: You should not use this for general formatting.
   */
  formatDateRawToParts(date: CalendarDate | UnixEpochTime, options?: DateRawFormatOptions): Part[];

}

/**
 * General functions.
 *
 * @alpha
 */
export interface General {

  /**
   * Returns the character order for the current locale, e.g. "ltr" for left-to-right
   * or "rtl" for right-to-left.
   */
  characterOrder(): CharacterOrderType;

  /**
   * Returns the line order for the current locale, e.g. "ttb" for top-to-bottom
   * or "btt" for bottom-to-top.
   */
  lineOrder(): LineOrderType;

  /**
   * Format a list of items to string using the given list type.
   */
  formatList(items: string[], type?: ListPatternType): string;

  /**
   * Format a list of items to an array of parts using the given list type.
   */
  formatListToParts(items: string[], type?: ListPatternType): Part[];

  /**
   * Returns the display name for the given script code.
   */
  getScriptDisplayName(code: ScriptIdType): string;

  /**
   * Returns the display name for the given region code.
   */
  getRegionDisplayName(code: RegionIdType, type?: string): string;
}

/**
 * Number and currency functions.
 *
 * @alpha
 */
export interface Numbers {

  /**
   * Formats a decimal number to string.
   */
  formatDecimal(num: DecimalArg, options?: DecimalFormatOptions): string;

  /**
   * Formats a decimal number to an array of parts.
   */
  formatDecimalToParts(num: DecimalArg, options?: DecimalFormatOptions): Part[];

  /**
   * Formats a currency value to string.
   */
  formatCurrency(num: DecimalArg, code: CurrencyType, options?: CurrencyFormatOptions): string;

  /**
   * Formats a currency value to an array of parts.
   */
  formatCurrencyToParts(num: DecimalArg, code: CurrencyType, options?: CurrencyFormatOptions): Part[];

  /**
   * Returns the currency symbol of the given width.
   */
  getCurrencySymbol(code: CurrencyType, width?: CurrencySymbolWidthType): string;

  /**
   * Returns the display name of the currency.
   */
  getCurrencyDisplayName(code: CurrencyType): string;

  /**
   * Returns the pluralized display name of the currency.
   */
  getCurrencyPluralName(code: CurrencyType, plural: string): string;

  /**
   * Return the currency fraction info for a given currency code.
   */
  getCurrencyFractions(code: CurrencyType): CurrencyFractions;

  /**
   * Returns the plural cardinal category of the given decimal number.
   */
  getPluralCardinal(num: DecimalArg): string;

  /**
   * Returns the plural ordinal category of the given decimal number.
   */
  getPluralOrdinal(num: DecimalArg): string;

}

/**
 * Unit quantity functions.
 *
 * @alpha
 */
export interface Units {

  /**
   * Formats the given unit quantity to string.
   */
  formatQuantity(qty: Quantity, options?: UnitFormatOptions): string;

  /**
   * Formats the given unit quantity to an array of parts.
   */
  formatQuantityToParts(qty: Quantity, options?: UnitFormatOptions): Part[];

  /**
   * Formats the given unit quantity sequence to string.
   */
  formatQuantitySequence(qty: Quantity[], options?: UnitFormatOptions): string;

  /**
   * Formats the given unit quantity sequence to an array of parts.
   */
  formatQuantitySequenceToParts(qty: Quantity[], options?: UnitFormatOptions): Part[];

  /**
   * Returns the display name for the given unit.
   */
  getUnitDisplayName(name: UnitType, length?: UnitLength): string;

}

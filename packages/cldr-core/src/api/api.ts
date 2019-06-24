import {
  CharacterOrderType,
  CurrencyType,
  DateFieldType,
  DateTimePatternFieldType,
  LineOrderType,
  UnitType
} from '@phensley/cldr-schema';
import { DecimalArg, Part } from '@phensley/decimal';

import {
  CalendarFieldsOptions,
  CurrencyFormatOptions,
  CurrencyFractions,
  CurrencySymbolWidthType,
  DateFieldFormatOptions,
  DateFormatOptions,
  DateIntervalFormatOptions,
  DateRawFormatOptions,
  DecimalFormatOptions,
  DisplayNameOptions,
  EraFieldOptions,
  ListPatternType,
  MeasurementCategory,
  MeasurementSystem,
  Quantity,
  RelativeTimeFormatOptions,
  TimeZoneInfo,
  UnitFormatOptions,
  UnitLength,
  ZonedDateTime,
} from '../common';

import { Bundle } from '../resource';
import { LanguageTag, Locale } from '../locale';

import {
  BuddhistDate,
  CalendarDate,
  GregorianDate,
  ISO8601Date,
  JapaneseDate,
  PersianDate,
} from '../systems/calendars';

/**
 * Calendar, date and time functions.
 *
 * @alpha
 */
export interface Calendars {

  dateField(type: DateFieldType, options?: DateFieldFormatOptions): string;
  dayPeriods(options?: CalendarFieldsOptions): any;
  eras(options?: EraFieldOptions): any;
  months(options?: CalendarFieldsOptions): any;
  quarters(options?: CalendarFieldsOptions): any;
  weekdays(options?: CalendarFieldsOptions): any;

  /**
   * Convert a date time into a date in the Buddhist calendar, with locale-specific
   * week data.
   */
  toBuddhistDate(date: CalendarDate | ZonedDateTime | Date): BuddhistDate;

  /**
   * Convert a date time into a date in the Gregorian calendar, with locale-specific
   * week data.
   */
  toGregorianDate(date: CalendarDate | ZonedDateTime | Date): GregorianDate;

  /**
   * Convert a date time into a date in the ISO-8601 calendar, with ISO week data.
   */
  toISO8601Date(date: CalendarDate | ZonedDateTime | Date): ISO8601Date;

  /**
   * Convert a date time into a date in the Japanese calendar, with locale-specific
   * week data.
   */
  toJapaneseDate(date: CalendarDate | ZonedDateTime | Date): JapaneseDate;

  /**
   * Convert a date time into a date in the Persian calendar, with locale-specific
   * week data.
   */
  toPersianDate(date: CalendarDate | ZonedDateTime | Date): PersianDate;

  /**
   * Calculate the field of greatest difference between two dates. This can be used
   * to choose an appropriate date or time skeleton for interval formatting.
   */
  fieldOfGreatestDifference(
    a: CalendarDate | ZonedDateTime | Date,
    b: CalendarDate | ZonedDateTime | Date): DateTimePatternFieldType;

  /**
   * Formats a date-time value to string.
   */
  formatDate(date: CalendarDate | ZonedDateTime | Date, options?: DateFormatOptions): string;

  /**
   * Formats a date-time value to an array of parts.
   */
  formatDateToParts(date: CalendarDate | ZonedDateTime | Date, options?: DateFormatOptions): Part[];

  /**
   * Formats a date-time interval for the given skeleton to string.
   */
  formatDateInterval(start: CalendarDate | ZonedDateTime | Date, end: CalendarDate | ZonedDateTime | Date,
    options?: DateIntervalFormatOptions): string;

  /**
   * Formats a date-time interval for the given skeleton to an array of parts.
   */
  formatDateIntervalToParts(start: CalendarDate | ZonedDateTime | Date, end: CalendarDate | ZonedDateTime | Date,
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
  formatDateRaw(date: CalendarDate | ZonedDateTime | Date, options?: DateRawFormatOptions): string;

  /**
   * Formats a date-time value to an array of parts using a raw date-time pattern.
   *
   * Warning: You should not use this for general formatting.
   */
  formatDateRawToParts(date: CalendarDate | ZonedDateTime | Date, options?: DateRawFormatOptions): Part[];

  /**
   * Return an array containing the official TZDB timezone identifiers.
   */
  timeZoneIds(): string[];

  /**
   * Resolve a timezone id / alias to the official TZDB identifier.
   */
  resolveTimeZoneId(zoneid: string): string | undefined;

  /**
   * Return additional information for a timezone id, including the
   * localized exemplar city, e.g. { id: "America/New_York", city: { name: "New York" } }
   */
  timeZoneInfo(zoneid: string): TimeZoneInfo;
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
   * Returns the resource bundle for the current locale.
   */
  bundle(): Bundle;

  /**
   * Returns the current locale.
   */
  locale(): Locale;

  /**
   * Resolves the given language tag into a locale.
   */
  resolveLocale(id: string | LanguageTag): Locale;

  /**
   * Parses a language tag and canonicalizes its fields.
   */
  parseLanguageTag(tag: string): LanguageTag;

  /**
   * Returns the measurement system in use for the current locale generally,
   * or for a specific measurement category. For example, to get the correct
   * measurement system for temperature you must pass in the category 'temperature'.
   */
  measurementSystem(category?: MeasurementCategory): MeasurementSystem;

  /**
   * Format a list of items to string using the given list type.
   */
  formatList(items: string[], type?: ListPatternType): string;

  /**
   * Format a list of items to an array of parts using the given list type.
   */
  formatListToParts(items: string[], type?: ListPatternType): Part[];

  /**
   * Returns the display name for the given language code.
   */
  getLanguageDisplayName(code: string, options?: DisplayNameOptions): string;

  /**
   * Returns the display name for the given script code.
   */
  getScriptDisplayName(code: string, options?: DisplayNameOptions): string;

  /**
   * Returns the display name for the given region code.
   */
  getRegionDisplayName(code: string, options?: DisplayNameOptions): string;
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
   * Return the currency code to use for a given region.
   */
  getCurrencyForRegion(region: string): CurrencyType;

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
   * Returns an array of available units.
   */
  availableUnits(): UnitType[];

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

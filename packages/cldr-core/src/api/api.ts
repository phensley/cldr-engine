import {
  CharacterOrderType,
  CurrencyType,
  DateFieldType,
  DateTimePatternFieldType,
  LineOrderType,
  RelativeTimeFieldType,
  UnitType,
} from '@phensley/cldr-types';

import { MessageFormatter, MessageFormatterOptions } from '@phensley/messageformat';
import { Decimal, DecimalArg, Part } from '@phensley/decimal';
import { ZoneInfo } from '@phensley/timezone';

import {
  CalendarFieldsOptions,
  CurrencyDisplayNameOptions,
  CurrencyFormatOptions,
  CurrencyFractions,
  CurrencySymbolWidthType,
  DateFieldFormatOptions,
  DateFormatOptions,
  DateIntervalFormatOptions,
  DateRawFormatOptions,
  DateWrapperFormatOptions,
  DecimalAdjustOptions,
  DecimalFormatOptions,
  DisplayNameOptions,
  EraFieldOptions,
  ListPatternType,
  MeasurementCategory,
  MeasurementSystem,
  Quantity,
  RelativeTimeFieldFormatOptions,
  RelativeTimeFormatOptions,
  TimeData,
  TimeZoneInfo,
  UnitFormatOptions,
  UnitLength,
  ZonedDateTime,
} from '../common';

import { Bundle } from '../resource';
import { LanguageTag } from '@phensley/language-tag';
import { Locale } from '@phensley/locale';

import {
  BuddhistDate,
  CalendarDate,
  CalendarDateFields,
  GregorianDate,
  ISO8601Date,
  JapaneseDate,
  PersianDate,
  TimePeriod,
} from '../systems/calendars';

/**
 * Calendar, date and time functions.
 *
 * @public
 */
export interface Calendars {
  /**
   * First day of the week for this locale, e.g. 1=SUN, 2=MON, etc.
   */
  firstDayOfWeek(): number;

  /**
   * Minimum number of days to count as a new week in a month or year in this locale.
   */
  minDaysInFirstWeek(): number;

  /**
   * Date field's string representation for this locale.
   */
  dateField(type: DateFieldType, options?: DateFieldFormatOptions): string;

  /**
   * Mapping of all day periods for this locale.
   */
  dayPeriods(options?: CalendarFieldsOptions): any;

  /**
   * Mapping of all eras for this locale.
   */
  eras(options?: EraFieldOptions): any;

  /**
   * Mapping of all months for this locale.
   */
  months(options?: CalendarFieldsOptions): any;

  /**
   * Mapping of all quarters for this locale.
   */
  quarters(options?: CalendarFieldsOptions): any;

  /**
   * Mapping of all weekdays for this locale.
   */
  weekdays(options?: CalendarFieldsOptions): any;

  /**
   * Convert a date time into a date in the Buddhist calendar, with locale-specific
   * week data.
   */
  toBuddhistDate(date: CalendarDate | ZonedDateTime | Date): BuddhistDate;

  /**
   * Construct a new date in the Buddhist calendar with the given fields.
   */
  newBuddhistDate(fields: Partial<CalendarDateFields>): BuddhistDate;

  /**
   * Convert a date time into a date in the Gregorian calendar, with locale-specific
   * week data.
   */
  toGregorianDate(date: CalendarDate | ZonedDateTime | Date): GregorianDate;

  /**
   * Construct a new date in the Gregorian calendar with the given fields.
   */
  newGregorianDate(fields: Partial<CalendarDateFields>): GregorianDate;

  /**
   * Convert a date time into a date in the ISO-8601 calendar, with ISO week data.
   */
  toISO8601Date(date: CalendarDate | ZonedDateTime | Date): ISO8601Date;

  /**
   * Construct a new date in the ISO-8601 calendar with the given fields.
   */
  newISO8601Date(fields: Partial<CalendarDateFields>): ISO8601Date;

  /**
   * Convert a date time into a date in the Japanese calendar, with locale-specific
   * week data.
   */
  toJapaneseDate(date: CalendarDate | ZonedDateTime | Date): JapaneseDate;

  /**
   * Construct a new date in the Japanese calendar with the given fields.
   */
  newJapaneseDate(fields: Partial<CalendarDateFields>): JapaneseDate;

  /**
   * Convert a date time into a date in the Persian calendar, with locale-specific
   * week data.
   */
  toPersianDate(date: CalendarDate | ZonedDateTime | Date): PersianDate;

  /**
   * Construct a new date in the Persian calendar with the given fields.
   */
  newPersianDate(fields: Partial<CalendarDateFields>): PersianDate;

  /**
   * Calculate the field of visual difference between two dates. This can be used
   * to choose an appropriate date or time skeleton for interval formatting.
   * Returns undefined if the dates are equivalent down to the second.
   */
  fieldOfVisualDifference(
    a: CalendarDate | ZonedDateTime | Date,
    b: CalendarDate | ZonedDateTime | Date,
  ): DateTimePatternFieldType | undefined;

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
  formatDateInterval(
    start: CalendarDate | ZonedDateTime | Date,
    end: CalendarDate | ZonedDateTime | Date,
    options?: DateIntervalFormatOptions,
  ): string;

  /**
   * Formats a date-time interval for the given skeleton to an array of parts.
   */
  formatDateIntervalToParts(
    start: CalendarDate | ZonedDateTime | Date,
    end: CalendarDate | ZonedDateTime | Date,
    options?: DateIntervalFormatOptions,
  ): Part[];

  /**
   * Formats a relative time field to string.
   */
  formatRelativeTimeField(
    value: DecimalArg,
    field: RelativeTimeFieldType,
    options?: RelativeTimeFieldFormatOptions,
  ): string;

  /**
   * Formats the relative time from a start to end date.
   */
  formatRelativeTime(
    start: CalendarDate | ZonedDateTime | Date,
    end: CalendarDate | ZonedDateTime | Date,
    options?: RelativeTimeFormatOptions,
  ): string;

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
   * Formats a date and time string together using a wrapper format of the given width. This can be
   * used when you need to format a date and time string separately and join them together.
   */
  formatDateWrapper(date: string, time: string, options?: DateWrapperFormatOptions): string;

  /**
   * Formats  date and time `Part[]` together using a wrapper format of the given width. This can be
   * used when you need to format a date and time string separately and join them together.
   */
  formatDateWrapperToParts(date: Part[], time: Part[], options?: DateWrapperFormatOptions): Part[];

  /**
   * Return information about the locale's preferred and allowed time cycles.
   */
  timeData(): TimeData;

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
   * localized exemplar city, e.g. `{ id: "America/New_York", city: { name: "New York" } }`
   */
  timeZoneInfo(zoneid: string): TimeZoneInfo;

  /**
   * Convert a time period into a quantiy sequence, for unit formatting, e.g. "1 year, 2 months".
   */
  timePeriodToQuantity(period: Partial<TimePeriod>): Quantity[];

  /**
   * Lookup the time zone info for the given UTC timestamp (in milliseconds).
   * Info includes the abbreviation, offset, daylight savings flag. Returns undefined if the
   * zoneid doesn't exist.
   */
  timeZoneFromUTC(utc: number, zoneid: string): ZoneInfo | undefined;

  /**
   * Lookup the time zone info for the given local "wall clock" timestamp (in milliseconds).
   * It also returns the corresponding UTC timestamp. Info includes the abbreviation, offset,
   * daylight savings flag. Returns undefined if the zoneid doesn't exist.
   */
  timeZoneFromWall(wall: number, zoneid: string): [number, ZoneInfo] | undefined;
}

/**
 * General functions.
 *
 * @public
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
   * Returns a message formatter instance for the current locale.
   */
  messageFormatter(options?: MessageFormatterOptions): MessageFormatter;

  /**
   * Returns the measurement system in use for the current locale generally,
   * or for a specific measurement category. For example, to get the correct
   * measurement system for temperature you must pass in the category 'temperature'.
   */
  measurementSystem(category?: MeasurementCategory): MeasurementSystem;

  /**
   * Format a message with the given arguments.
   */
  // formatMessage(message: string, positional: MessageArg[], named: MessageNamedArgs): string;

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
  getLanguageDisplayName(code: string | LanguageTag, options?: DisplayNameOptions): string;

  /**
   * Returns the display name for the given script code.
   */
  getScriptDisplayName(code: string | LanguageTag, options?: DisplayNameOptions): string;

  /**
   * Returns the display name for the given region code.
   */
  getRegionDisplayName(code: string | LanguageTag, options?: DisplayNameOptions): string;
}

/**
 * Number and currency functions.
 *
 * @public
 */
export interface Numbers {
  /**
   * Adjusts a decimal number using the given options.
   */
  adjustDecimal(num: DecimalArg, options?: DecimalAdjustOptions): Decimal;

  /**
   * Parses the string or JavaScript number and returns a Decimal instance.
   */
  parseDecimal(num: number | string): Decimal;

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
   * Formats a decimal number using a rule-based number format.
   */
  // formatRuleBased(num: DecimalArg, options?: RuleBasedFormatOptions): string;

  /**
   * Returns the currency symbol of the given width.
   */
  getCurrencySymbol(code: CurrencyType, width?: CurrencySymbolWidthType): string;

  /**
   * Returns the display name of the currency.
   */
  getCurrencyDisplayName(code: CurrencyType, options?: CurrencyDisplayNameOptions): string;

  /**
   * Returns the pluralized display name of the currency.
   */
  getCurrencyPluralName(num: DecimalArg, code: CurrencyType, options?: CurrencyDisplayNameOptions): string;

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
  getPluralCardinal(n: DecimalArg, options?: DecimalAdjustOptions): string;

  /**
   * Returns the plural ordinal category of the given decimal number.
   */
  getPluralOrdinal(num: DecimalArg, options?: DecimalAdjustOptions): string;

  /**
   * Returns the list of available rule-based number formats for the current locale.
   */
  // ruleBasedFormatNames(): string[];
}

/**
 * Unit quantity functions.
 *
 * @public
 */
export interface Units {
  /**
   * Returns an array of available units.
   */
  availableUnits(): UnitType[];

  /**
   * Convert a decimal value between units.
   */
  // convertDecimal(n: Decimal, from: UnitType, to: UnitType, options?: UnitConvertOptions): Decimal | undefined;

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

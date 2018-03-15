import {
  Alt,
  AvailableFormatType,
  Bundle,
  DayPeriodsFormats,
  DayPeriodType,
  Gregorian,
  EraType,
  EraValues,
  ErasFormat,
  FormatWidthType,
  QuarterType,
  QuarterValues,
  QuartersFormats,
  MetaZoneType,
  MonthType,
  MonthValues,
  MonthsFormats,
  Schema,
  TimeZoneNames,
  WeekdayType,
  WeekdaysFormat,
  WeekdaysFormats,
  WeekdayValues,
  TimeZoneType
} from '@phensley/cldr-schema';

import { weekFirstDay } from './autogen.weekdata';
import { DateTimeNode, parseDatePattern, intervalPatternBoundary } from '../../parsing/patterns/date';
import { GregorianFormatOptions } from './options';
import { Cache } from '../../utils/cache';
import { zeroPad2 } from '../../utils/string';
import { Part, ZonedDateTime } from '../../types';
import { WrapperInternal } from '../wrapper';

/**
 * Function that formats a given date field.
 */
export type FormatterFunc = (
  bundle: Bundle,
  date: ZonedDateTime,
  ch: string,
  width: number
) => string;

export interface FieldFormatter {
  readonly type: string;
  readonly impl: FormatterFunc;
}

export type FieldFormatterMap = { [ch: string]: FieldFormatter };

type TZC = [number, boolean, number, number];

const getTZC = (offset: number): TZC => {
  const negative = offset < 0;
  if (negative) {
    offset *= -1;
  }
  const hours = offset / 60 | 0;
  const minutes = offset % 60;
  return [offset, negative, hours, minutes];
};

const parseHourFormat = (raw: string): [DateTimeNode[], DateTimeNode[]] => {
  const parts = raw.split(';');
  return parts.length !== 2 ? [[], []] : [parseDatePattern(parts[0]), parseDatePattern(parts[1])];
};

/**
 * Gregorian calendar internal engine singleton, shared across all locales.
 */
 export class GregorianInternal {

  readonly Gregorian: Gregorian;
  readonly dayPeriods: DayPeriodsFormats;
  readonly eras: ErasFormat;
  readonly months: MonthsFormats;
  readonly quarters: QuartersFormats;
  readonly weekdays: WeekdaysFormats;
  readonly TimeZoneNames: TimeZoneNames;
  readonly datePatternCache: Cache<DateTimeNode[]>;
  readonly hourFormatCache: Cache<[DateTimeNode[], DateTimeNode[]]>;

  private impl: FieldFormatterMap = {
    'G': { type: 'era', impl: this.era },
    'y': { type: 'year', impl: this.year },
    'Y': { type: 'iso-year', impl: this.isoYear },
    // 'u': - non-gregorian
    // 'U': - non-gregorian
    // 'r': - non-gregorian
    'Q': { type: 'quarter', impl: this.quarter },
    'q': { type: 'quarter', impl: this.quarter },
    'M': { type: 'month', impl: this.month },
    'L': { type: 'month', impl: this.month },
    // 'l': deprecated
    'w': { type: 'iso-week', impl: this.isoWeek },
    'W': { type: 'week-of-month', impl: this.weekOfMonth },
    'd': { type: 'day', impl: this.dayOfMonth },
    'D': { type: 'date', impl: this.dayOfYear },
    'F': { type: 'day', impl: this.dayOfWeekInMonth },
    'g': { type: '', impl: this.modifiedJulianDay },
    'E': { type: 'weekday', impl: this.weekday },
    'e': { type: 'weekday', impl: this.weekdayLocal },
    'c': { type: 'weekday', impl: this.weekdayLocalStandalone },
    'a': { type: 'dayperiod', impl: this.dayPeriod },
    'b': { type: 'dayperiod', impl: this.dayPeriodExt },
    'B': { type: 'dayperiod', impl: this.dayPeriodFlex },
    'h': { type: 'hour', impl: this.hour },
    'H': { type: 'hour', impl: this.hour },
    'K': { type: 'hour', impl: this.hourAlt },
    'k': { type: 'hour', impl: this.hourAlt },
    // 'j' - input skeleton symbol
    // 'J' - input skeleton symbol
    // 'C' - input skeleton symbol
    'm': { type: 'minute', impl: this.minute },
    's': { type: 'second', impl: this.second },
    'S': { type: 'fracsec', impl: this.fractionalSecond },
    // 'A'
    'z': { type: 'timezone', impl: this.timeZone_z },
    'Z': { type: 'timezone', impl: this.timeZone_Z },
    'O': { type: 'timezone', impl: this.timeZone_O },
    'v': { type: 'timezone', impl: this.timeZone_v },
    'V': { type: 'timezone', impl: this.timeZone_V },
    'X': { type: 'timezone', impl: this.timeZone_8601basic },
    'x': { type: 'timezone', impl: this.timeZone_8601basic }
  };

  constructor(
    readonly root: Schema,
    readonly wrapper: WrapperInternal,
    readonly cacheSize: number = 50) {

    this.Gregorian = root.Gregorian;
    this.dayPeriods = root.Gregorian.dayPeriods;
    this.eras = root.Gregorian.eras;
    this.months = root.Gregorian.months;
    this.quarters = root.Gregorian.quarters;
    this.weekdays = root.Gregorian.weekdays;
    this.TimeZoneNames = root.TimeZoneNames;

    this.datePatternCache = new Cache(parseDatePattern, cacheSize);
    this.hourFormatCache = new Cache(parseHourFormat, cacheSize);
  }

  /**
   * Format a date-time pattern into a string.
   */
  format(bundle: Bundle, date: ZonedDateTime, options: GregorianFormatOptions): string {
    const timeKey = options === undefined ? undefined : (options.datetime || options.time);
    const timePattern = this.getTimePattern(bundle, timeKey);

    let dateKey: string | undefined;
    if (options !== undefined) {
      dateKey = options.datetime || options.date;
    }
    if (timeKey === undefined && dateKey === undefined) {
      dateKey = 'full';
    }
    const datePattern = this.getDatePattern(bundle, dateKey);

    const wrapperRaw = this.getWrapperPattern(bundle, options);
    const _date = datePattern === undefined ? undefined : this._format(bundle, date, datePattern);
    const _time = timePattern === undefined ? undefined : this._format(bundle, date, timePattern);

    if (wrapperRaw !== undefined && _date !== undefined && _time !== undefined) {
      return this.wrapper.format(wrapperRaw, [_time, _date]);
    }
    return _date !== undefined ? _date : _time !== undefined ? _time : '';
  }

  /**
   * Format a pattern into an array of parts, each part being either a string literal
   * or a named field.
   */
  formatParts(bundle: Bundle, date: ZonedDateTime, options: GregorianFormatOptions): Part[] {
    const timeKey = options === undefined ? undefined : (options.datetime || options.time);
    const timePattern = this.getTimePattern(bundle, timeKey);

    let dateKey: string | undefined;
    if (options !== undefined) {
      dateKey = options.datetime || options.date;
    }
    if (timeKey === undefined && dateKey === undefined) {
      dateKey = 'full';
    }
    const datePattern = this.getDatePattern(bundle, dateKey);

    const wrapperRaw = this.getWrapperPattern(bundle, options);
    const _date = datePattern === undefined ? undefined : this._formatParts(bundle, date, datePattern);
    const _time = timePattern === undefined ? undefined : this._formatParts(bundle, date, timePattern);

    if (wrapperRaw !== undefined && _date !== undefined && _time !== undefined) {
      return this.wrapper.formatParts(wrapperRaw, [_time, _date]);
    }
    return _date !== undefined ? _date : _time !== undefined ? _time : [];
  }

  /**
   * Format a date-time interval pattern as a sring.
   */
  formatInterval(bundle: Bundle, start: ZonedDateTime, end: ZonedDateTime, pattern: string): string {
    const format = this.datePatternCache.get(pattern);
    // TODO: use fallback format if format.length == 0
    const idx = intervalPatternBoundary(format);
    const res = this._format(bundle, start, format.slice(0, idx));
    return res + this._format(bundle, end, format.slice(idx));
  }

  formatIntervalParts(bundle: Bundle, start: ZonedDateTime, end: ZonedDateTime, pattern: string): Part[] {
    const format = this.datePatternCache.get(pattern);
    const idx = intervalPatternBoundary(format);
    const res = this._formatParts(bundle, start, format.slice(0, idx));
    return res.concat(this._formatParts(bundle, end, format.slice(idx)));
  }

  formatRaw(bundle: Bundle, date: ZonedDateTime, pattern: string): string {
    return this._format(bundle, date, this.datePatternCache.get(pattern));
  }

  formatRawParts(bundle: Bundle, date: ZonedDateTime, pattern: string): Part[] {
    return this._formatParts(bundle, date, this.datePatternCache.get(pattern));
  }

  protected getDatePattern(bundle: Bundle, key: string | undefined): DateTimeNode[] | undefined {
    if (key !== undefined) {
      let pattern = this.Gregorian.dateFormats(bundle, key as FormatWidthType);
      if (pattern === '') {
        pattern = this.Gregorian.availableFormats(bundle, key as AvailableFormatType, Alt.NONE);
      }
      return pattern === '' ? undefined : this.datePatternCache.get(pattern);
    }
    return undefined;
  }

  protected getTimePattern(bundle: Bundle, key: string | undefined): DateTimeNode[] | undefined {
    if (key !== undefined) {
      let pattern = this.Gregorian.timeFormats(bundle, key as FormatWidthType);
      if (pattern === '') {
        pattern = this.Gregorian.availableFormats(bundle, key as AvailableFormatType, Alt.NONE);
      }
      return pattern === '' ? undefined : this.datePatternCache.get(pattern);
    }
    return undefined;
  }

  protected getWrapperPattern(bundle: Bundle, options: GregorianFormatOptions): string | undefined {
    let key = options.wrap;
    if (key === undefined) {
      if (options.datetime !== undefined) {
        key = options.datetime;
      } else if (options.date !== undefined && options.time !== undefined) {
        switch (options.date) {
        case 'full':
        case 'long':
        case 'medium':
        case 'short':
          key = options.date;
          break;
        default:
          key = 'short';
          break;
        }
      }
    }
    if (key !== undefined) {
      return this.Gregorian.dateTimeFormats(bundle, key);
    }
    return undefined;
  }

  protected _format(bundle: Bundle, date: ZonedDateTime, format: DateTimeNode[]): string {
    let res = '';
    for (const node of format) {
      if (typeof node === 'string') {
        res += node;
      } else {
        const func = this.impl[node.ch];
        if (func !== undefined) {
          res += func.impl.call(this, bundle, date, node.ch, node.width);
        }
      }
    }
    return res;
  }

  protected _formatParts(bundle: Bundle, date: ZonedDateTime, format: DateTimeNode[]): Part[] {
    const res = [];
    for (const node of format) {
      if (typeof node === 'string') {
        res.push({ type: 'literal', value: node });
      } else {
        const func = this.impl[node.ch];
        if (func !== undefined) {
          const value = func.impl.call(this, bundle, date, node.ch, node.width);
          res.push({ type: func.type, value });
        }
      }
    }
    return res;
  }

  protected dayOfMonth(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const day = date.getDayOfMonth();
    return zeroPad2(day, width);
  }

  protected dayOfWeekInMonth(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    // TODO:
    return '';
  }

  protected dayOfYear(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const day = date.getDayOfYear();
    return day < 10 ? `${day}` : day < 100 ? `0${day}` : `00${day}`;
  }

  protected dayPeriod(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const format = this.dayPeriods.format;
    const key = date.getHour() < 13 ? 'am' : 'pm';
    switch (width) {
    case 5:
      return format.narrow(bundle, key, Alt.NONE);
    case 4:
      return format.wide(bundle, key, Alt.NONE);
    default:
    return format.abbreviated(bundle, key, Alt.NONE);
    }
  }

  protected dayPeriodExt(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const format = this.dayPeriods.format;
    const hour = date.getHour();
    const minute = date.getMinute();
    let key: DayPeriodType = hour < 13 ? 'am' : 'pm';
    if (minute === 0) {
      if (hour === 0) {
        key = 'midnight';
      } else if (hour === 12) {
        key = 'noon';
      }
    }
    switch (width) {
    case 5:
      return format.narrow(bundle, key, Alt.NONE);
    case 4:
      return format.wide(bundle, key, Alt.NONE);
    default:
      return format.abbreviated(bundle, key, Alt.NONE);
    }
  }

  protected dayPeriodFlex(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    // TODO: need to embed the dayPeriodRules.
    return '';
  }

  protected era(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const format = this.eras;
    const year = date.getYear();
    const e = year < 0 ? 0 : 1;
    const era = EraValues[e] as EraType;
    switch (width) {
    case 5:
      return format.narrow(bundle, era);
    case 4:
      return format.names(bundle, era);
    default:
      return format.abbr(bundle, era);
    }
  }

  protected fractionalSecond(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    let millis = date.getMillisecond();
    let r = '';
    let f = 1000;
    while (width > 0 && f > 0) {
      const digit = Math.floor(millis / f);
      millis -= (digit * f);
      f /= 10;
      r += digit;
      width--;
    }
    return r;
  }

  protected hour(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    return this._formatHour(date.getHour(), field, width);
  }

  protected _formatHour(hour: number, field: string, width: number): string {
    const twelve = field === 'h';
    if (twelve && hour > 12) {
      hour = hour - 12;
    }
    if (twelve && hour === 0) {
      hour = 12;
    }
    return zeroPad2(hour, width);
  }

  protected hourAlt(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const twelve = field === 'K';
    let hours = date.getHour();
    if (twelve) {
      if (hours >= 12) {
        hours -= 12;
      }
    } else {
      hours++;
    }
    return zeroPad2(hours, width);
  }

  protected minute(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    return zeroPad2(date.getMinute(), width);
  }

  protected modifiedJulianDay(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    // TODO:
    return '';
  }

  protected month(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const format = field === 'M' ? this.months.format : this.months.standAlone;
    const index = date.getMonth();
    const month = MonthValues[index] as MonthType;
    switch (width) {
    case 5:
      return format.narrow(bundle, month);
    case 4:
      return format.wide(bundle, month);
    case 3:
      return format.abbreviated(bundle, month);
    default:
      return zeroPad2(index + 1, width);
    }
  }

  protected monthWeek(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    // TODO:
    return '';
  }

  protected quarter(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const format = field === 'Q' ? this.quarters.format : this.quarters.standAlone;
    const index = (date.getMonth() / 3) + 1;
    const quarter = QuarterValues[index] as QuarterType;
    switch (width) {
    case 5:
      return format.narrow(bundle, quarter);
    case 4:
      return format.wide(bundle, quarter);
    case 3:
      return format.abbreviated(bundle, quarter);
    default:
      return width === 2 ? `0${quarter}` : `${quarter}`;
    }
  }

  protected second(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    return zeroPad2(date.getSecond(), width);
  }

  protected weekday(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    return this._weekday(bundle, date, field, width, this.weekdays.format);
  }

  protected weekdayLocal(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    if (width > 2) {
      return this._weekday(bundle, date, field, width, this.weekdays.format);
    }
    const weekday = this._weekdayNumeric(bundle, date);
    return width === 2 ? `0${weekday}` : `${weekday}`;
  }

  protected weekdayLocalStandalone(
    bundle: Bundle, date: ZonedDateTime, field: string, width: number
  ): string {
    if (width > 2) {
      return this._weekday(bundle, date, field, width, this.weekdays.standAlone);
    }
    return `${this._weekdayNumeric(bundle, date)}`;
  }

  protected _weekday(
    bundle: Bundle, date: ZonedDateTime, field: string, width: number, format: WeekdaysFormat): string {

    const index = date.getDayOfWeek() % 7;
    const weekday = WeekdayValues[index] as WeekdayType;
    switch (width) {
    case 6:
      return format.short(bundle, weekday);
    case 5:
      return format.narrow(bundle, weekday);
    case 4:
      return format.wide(bundle, weekday);
    default:
      return format.abbreviated(bundle, weekday);
    }
  }

  /**
   * Convert ISO-8601 week number where mon=1 and sun=7. We adjust it using the
   * locale's "first day of the week" which in the US is Sunday.
   */
  protected _weekdayNumeric(bundle: Bundle, date: ZonedDateTime): number {
    const region = bundle.region();
    const weekday = date.getDayOfWeek();
    const firstDay = weekFirstDay[region] || weekFirstDay['001'];
    return (7 - firstDay + weekday) % 7 + 1;
  }

  protected weekOfMonth(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    // TODO:
    return '';
  }

  protected isoWeek(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const week = date.getISOWeek();
    switch (width) {
    case 2:
      return zeroPad2(week, width);
    default:
      return String(week);
    }
  }

  protected year(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    return this._year(date.getYear(), width);
  }

  protected isoYear(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    return this._year(date.getISOYear(), width);
  }

  /**
   * Timezone: short/long specific non-location format.
   * https://www.unicode.org/reports/tr35/tr35-dates.html#dfst-zone
   */
  protected timeZone_z(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    if (width > 4) {
      return '';
    }

    const metaZoneId = date.metaZoneId();
    const isDST = date.isDaylightSavings();
    const info = this.TimeZoneNames.metaZones(metaZoneId as MetaZoneType);
    if (info !== undefined) {
      const format = width === 4 ? info.long : info.short;
      const name = isDST ? format.daylight(bundle) : format.standard(bundle);
      if (name !== '') {
        return name;
      }
    }

    // Fall back to 'O' or 'OOOO'
    return this.timeZone_O(bundle, date, 'O', width);
  }

  /**
   * Timezone: ISO8601 basic/extended format, long localized GMT format.
   * https://www.unicode.org/reports/tr35/tr35-dates.html#dfst-zone
   */
  protected timeZone_Z(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    if (width === 4) {
      return this.timeZone_O(bundle, date, 'O', width);
    }

    const [offset, negative, hours, minutes] = getTZC(date.timezoneOffset());

    let fmt = '';
    switch (width) {
    case 5:
    case 3:
    case 2:
    case 1:
      fmt += negative ? '-' : '+';
      fmt += zeroPad2(hours, 2);
      if (width === 5) {
        fmt += ':';
      }
      fmt += zeroPad2(minutes, 2);
      break;
    }
    return fmt;
  }

  /**
   * Timezone: short/long localized GMT format.
   */
  protected timeZone_O(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const offset = date.timezoneOffset();
    switch (width) {
    case 1:
      return this._wrapGMT(bundle, offset, true);
    case 4:
      return this._wrapGMT(bundle, offset, false);
    }
    return '';
  }

  /**
   * Timezone: short/long generic non-location format.
   */
  protected timeZone_v(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    if (width !== 1 && width !== 4) {
      return '';
    }

    const metaZoneId = date.metaZoneId();
    const info = this.TimeZoneNames.metaZones(date.metaZoneId() as MetaZoneType);
    let name = '';
    if (info !== undefined) {
      const format = width === 1 ? info.short : info.long;
      name = format.generic(bundle);
    }

    if (name !== '') {
      return name;
    }

    // Fall back to 'O' or 'OOOO'
    return this.timeZone_O(bundle, date, 'O', width);
  }

  /**
   * Timezone: short/long zone ID, exemplar city, generic location format.
   * https://www.unicode.org/reports/tr35/tr35-dates.html#dfst-zone
   */
  protected timeZone_V(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const zoneId = date.zoneId();
    switch (width) {
    case 4:
    {
      // Generic location format, e.g. "Los Angeles Time"
      const city = this.getExemplarCity(bundle, zoneId);
      if (city === '') {
        // TODO: docs say fallback to 'OOOO' only necessary for GMT-style
        // timezone ids. Need to create a mapping
        return this.timeZone_O(bundle, date, 'O', 4);
      }
      const pattern = this.TimeZoneNames.regionFormat(bundle);
      return this.wrapper.format(pattern, [city]);
    }

    case 3:
    {
      // Exemplar city for the time zone, e.g. "Los Angeles"
      const city = this.getExemplarCity(bundle, zoneId);
      return city !== '' ? city : this.getExemplarCity(bundle, 'Etc/Unknown');
    }

    case 2:
      // Long time zone ID, e.g. "America/Los_Angeles"
      return zoneId;

    case 1:
      // TODO: short time zone ID not present in JSON CLDR data.
      // return 'unk' for now
      return 'unk';
    }
    return '';
  }

  /**
   * Timezone: ISO8601 basic format
   * https://www.unicode.org/reports/tr35/tr35-dates.html#dfst-zone
   */
  protected timeZone_8601basic(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const [offset, negative, hours, minutes] = getTZC(date.timezoneOffset());
    let fmt = '';
    switch (width) {
    case 5:
    case 4:
    case 3:
    case 2:
    case 1:
      fmt += negative ? '-' : '+';
      fmt += zeroPad2(hours, 2);
      if (width === 3 || width === 5) {
        fmt += ':';
      }
      if (width !== 1 || minutes > 0) {
        fmt += zeroPad2(minutes, 2);
      }
      if (field === 'X' && offset === 0) {
        fmt += 'Z';
      }
      return fmt;
    }
    return '';
  }

  protected _year(year: number, width: number): string {
    if (width === 2) {
      year %= 100;
    }
    const digits = year >= 10000 ? 5 : year >= 1000 ? 4 : year >= 100 ? 3 : year >= 10 ? 2 : 1;
    if (width > 1) {
      const zeros = width - digits;
      if (zeros > 0) {
        return zeroPad2(year, zeros);
      }
    }
    return String(year);
  }

  protected _wrapGMT(bundle: Bundle, offset: number, short: boolean): string {
    // Dedicated GMT zero format
    if (offset === 0) {
      return this.TimeZoneNames.gmtZeroFormat(bundle);
    }

    const [_offset, negative, hours, minutes] = getTZC(offset);
    const emitMins = !short || minutes > 0;

    // Fetch the locale-specific hour format.
    const hourFormat = this.getHourFormat(bundle, negative);
    let fmt = '';
    for (const node of hourFormat) {
      if (typeof node === 'string') {
        // If we're suppressing minutes we need to also suppress the hour:minute separator
        const sep = node === '.' || node === ':';
        if (!sep || emitMins) {
          fmt += node;
        }
      } else {
        if (node.ch === 'H') {
          fmt += node.width === 1 ? zeroPad2(hours, 1) : zeroPad2(hours, short ? 1 : node.width);
        } else if (node.ch === 'm' && emitMins) {
          fmt += zeroPad2(minutes, node.width);
        }
      }
    }

    // Wrap into locale-specific GMT format
    const format = this.TimeZoneNames.gmtFormat(bundle);
    return this.wrapper.format(format, [fmt]);
  }

  protected getExemplarCity(bundle: Bundle, zoneId: string): string {
    const info = this.TimeZoneNames.timeZones(zoneId as TimeZoneType);
    return info !== undefined ? info.exemplarCity(bundle) : '';
  }

  protected getHourFormat(bundle: Bundle, negative: boolean): DateTimeNode[] {
    const raw = this.TimeZoneNames.hourFormat(bundle);
    const format = this.hourFormatCache.get(raw);
    return format[negative ? 1 : 0];
  }
}

import { ZonedDateTime } from '../../types/datetime';
import {
  Alt,
  Bundle,
  DayPeriodsFormats,
  DayPeriodType,
  Gregorian,
  EraType,
  EraValues,
  ErasFormat,
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
  WeekdaysFormats,
  WeekdayValues,
} from '@phensley/cldr-schema';

import { DateTimeNode, parseDatePattern, intervalPatternBoundary } from '../../parsing/patterns/date';
import { WrapperInternal } from '../wrapper';
import { Cache } from '../../utils/cache';
import { zeroPad2 } from '../../utils/string';
import { Part } from '../../types';

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

  // TODO: simpler LRU
  private readonly datePatternCache: Cache<DateTimeNode[]>;

  private impl: FieldFormatterMap = {
    'G': { type: 'era', impl: this.era },
    'y': { type: 'year', impl: this.year },
    'Y': { type: 'iso-year', impl: this.isoYear },
    // 'u': TODO
    // 'U': TODO
    // 'r': TODO
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
    'c': { type: 'weekday', impl: this.weekdayLocal },
    'a': { type: 'dayperiod', impl: this.dayPeriod },
    'b': { type: 'dayperiod', impl: this.dayPeriodExt },
    'B': { type: 'dayperiod', impl: this.dayPeriodFlex },
    'h': { type: 'hour', impl: this.hour },
    'H': { type: 'hour', impl: this.hour },
    'K': { type: 'hour', impl: this.hourAlt },
    'k': { type: 'hour', impl: this.hourAlt },
    // 'j'
    // 'J'
    // 'C'
    'm': { type: 'minute', impl: this.minute },
    's': { type: 'second', impl: this.second },
    'S': { type: 'fracsec', impl: this.fractionalSecond },
    // 'A'
    'z': { type: 'timezone', impl: this.timeZone_z },
    // 'Z' tz
    'O': { type: 'timezone', impl: this.timeZone_O },
    // 'v' tz
    // 'V' tz
    // 'X' tz
    // 'x' tz
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
  }

  /**
   * Format a date-time pattern into a string.
   */
  format(bundle: Bundle, date: ZonedDateTime, pattern: string): string {
    return this._format(bundle, date, this.datePatternCache.get(pattern));
  }

  /**
   * Format a pattern into an array of parts, each part being either a string literal
   * or a named field.
   */
  formatParts(bundle: Bundle, date: ZonedDateTime, pattern: string): Part[] {
    const format = this.datePatternCache.get(pattern);
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
      key = hour === 0 ? 'midnight' : 'noon';
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
    const twelve = field === 'h';
    let hours = date.getHour();
    if (twelve && hours > 12) {
      hours = hours - 12;
    }
    if (twelve && hours === 0) {
      hours = 12;
    }
    return zeroPad2(hours, width);
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
    const format = this.weekdays.format;
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

  protected weekdayLocal(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    // TODO: need to add start of week day.
    return '';
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

  protected timeZone_z(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    if (width > 4) {
      return '';
    }
    const zoneId = date.zoneId();
    const metaZoneId = date.metaZoneId();
    const isDST = date.isDaylightSavings();
    const metaZone = this.TimeZoneNames.metaZones(metaZoneId as MetaZoneType);
    const format = width === 4 ? metaZone.long : metaZone.short;
    const name = isDST ? format.daylight(bundle) : format.standard(bundle);
    return name;
  }

  protected timeZone_O(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const offset = date.timezoneOffset();
    const hours = offset / 60 | 0;
    const minutes = offset % 60;
    this.TimeZoneNames.gmtFormat(bundle);
    switch (width) {
    case 1:
      // return this._wrapper()
    //
    }
    // TODO:
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
    if (offset === 0) {
      return this.TimeZoneNames.gmtZeroFormat(bundle);
    }

    const negative = offset < 0;
    if (negative) {
      offset *= -1;
    }
    const hours = offset / 60 | 0;
    const minutes = offset % 60;
    const pattern = this.TimeZoneNames.gmtFormat(bundle);
    const hourformat = this.TimeZoneNames.hourFormat(bundle).split(';');
    const format = negative ? hourformat[0] : hourformat[1];
    // TODO:
    return '';
  }

}

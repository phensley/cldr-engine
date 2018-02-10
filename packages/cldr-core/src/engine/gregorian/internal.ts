import { Bundle, Root } from '@phensley/cldr-schema';
import { ZonedDateTime } from '../../types/datetime';
import {
  DayPeriodsFormats,
  Gregorian,
  EraType,
  QuarterType,
  MonthType,
  WeekdayType,
  WeekdaysFormats,
  MonthsFormats,
  QuartersFormats,
  ErasFormat,
  WeekdayValues,
  MonthValues,
  QuarterValues,
  EraValues,
} from '@phensley/cldr-schema';

import { DateTimeNode, splitDateIntervalPattern } from '../../parsing/patterns/date';

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

const zeroPad2 = (n: number, w: number): string => w === 2 && n < 10 ? `0${n}` : `${n}`;

/**
 * Wires up field formatters. Only has to be initialized once, on demand when
 * gregorian calendar formatting is needed.
 */
export class GregorianInternal {

  readonly Gregorian: Gregorian;
  readonly dayPeriods: DayPeriodsFormats;
  readonly eras: ErasFormat;
  readonly months: MonthsFormats;
  readonly quarters: QuartersFormats;
  readonly weekdays: WeekdaysFormats;

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
    'b': { type: 'dayperiod', impl: this.dayPeriod },
    'B': { type: 'dayperiod', impl: this.dayPeriod },
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
    // 'z' tz
    // 'Z' tz
    // 'O' tz
    // 'v' tz
    // 'V' tz
    // 'X' tz
    // 'x' tz
  };

  constructor(readonly root: Root) {
    this.Gregorian = root.Gregorian;
    this.dayPeriods = root.Gregorian.dayPeriods;
    this.eras = root.Gregorian.eras;
    this.months = root.Gregorian.months;
    this.quarters = root.Gregorian.quarters;
    this.weekdays = root.Gregorian.weekdays;
  }

  format(bundle: Bundle, date: ZonedDateTime, format: DateTimeNode[]): string {
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

  formatParts(bundle: Bundle, date: ZonedDateTime, format: DateTimeNode[]): any[] {
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

  formatInterval(bundle: Bundle, start: ZonedDateTime, end: ZonedDateTime, format: DateTimeNode[]): string {
    // TODO: use fallback format if format.length == 0
    const [ fst, snd ] = splitDateIntervalPattern(format);
    const res = this.format(bundle, start, fst);
    return res + this.format(bundle, end, snd);
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
    // TODO:
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
    if (twelve && hours < 12) {
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
    const format = this.months.format;
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
    const format = this.quarters.format;
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
    const weekday = WeekdayValues[date.getDayOfWeek()] as WeekdayType;
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
    // TODO:
    return '';
  }

  protected weekOfMonth(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    // TODO:
    return '';
  }

  protected isoWeek(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    // TODO:
    return '';
  }

  protected year(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    const year = date.getYear();
    return zeroPad2(year, width);
  }

  protected isoYear(bundle: Bundle, date: ZonedDateTime, field: string, width: number): string {
    // TODO:
    return '';
  }

}

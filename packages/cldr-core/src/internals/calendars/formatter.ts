import { CalendarSchema, MetaZoneType, TimeZoneSchema, TimeZoneType, Vector2Arrow } from '@phensley/cldr-schema';
import { Bundle, WrapperInternals } from '../..';
import { Internals } from '../internals';
import { CalendarDate } from '../../systems/calendars';
import { NumberingSystem } from '../../systems/numbering';
import { DateTimeNode, parseDatePattern } from '../../parsing/patterns/date';
import { Renderer } from '../../utils/render';
import { DayPeriodRules } from './rules';
import { Cache } from '../../utils/cache';

const min = Math.min;

/**
 * All context needed for a single format operation.
 */
export interface CalendarContext<T extends CalendarDate> {
  /**
   * Calendar-specific date
   */
  date: T;

  /**
   * Resource bundle for accessing strings
   */
  bundle: Bundle;

  // TODO: number params

  /**
   * Numbering system for formatting decimal numbers into strings
   */
  system: NumberingSystem;

  /**
   * Latin decimal digit numbering system.
   */
  latnSystem: NumberingSystem;
}

type TZC = [number, boolean, number, number];

const getTZC = (offset: number): TZC => {
  const negative = offset < 0;
  if (negative) {
    offset *= -1;
  }
  offset /= 60000;
  const hours = offset / 60 | 0;
  const minutes = offset % 60;
  return [offset, negative, hours, minutes];
};

const widthKey1 = (w: number) => w === 5 ? 'narrow' : w === 4 ? 'wide' : 'abbreviated';

export class CalendarFormatter<T extends CalendarDate> {

  readonly wrapper: WrapperInternals;
  readonly tz: TimeZoneSchema;

  constructor(
    readonly internals: Internals,
    readonly cal: CalendarSchema
  ) {
    this.wrapper = internals.wrapper;
    this.tz = internals.schema.TimeZones;
  }

  format<R>(rnd: Renderer<R>, ctx: CalendarContext<T>, nodes: DateTimeNode[]): void {
    for (const n of nodes) {
      if (typeof n === 'string') {
        rnd.add('literal', n);
        continue;
      }
      switch (n[0]) {
        case 'G': rnd.add('era', this.era(ctx, n[1])); break;
        case 'y': rnd.add('year', this.year(ctx, n[1])); break;
        case 'Y': rnd.add('year', this.yearOfWeekYear(ctx, n[1])); break;
        case 'u': rnd.add('year', this.extendedYear(ctx, n[1])); break;
        case 'U': rnd.add('cyclic-year', this.cyclicYear(ctx, n[1])); break;
        case 'r': rnd.add('related-year', this.relatedYear(ctx, n[1])); break;

        case 'Q':
        case 'q': rnd.add('quarter', this.quarter(ctx, n)); break;

        case 'M':
        case 'L': rnd.add('month', this.month(ctx, n)); break;

        // 'l' - deprecated

        case 'w': rnd.add('week', this.weekOfWeekYear(ctx, n)); break;
        case 'W': rnd.add('week', this.weekOfMonth(ctx, n)); break;
        case 'd': rnd.add('day', this.dayOfMonth(ctx, n)); break;
        case 'D': rnd.add('day', this.dayOfYear(ctx, n)); break;
        case 'F': rnd.add('day', this.dayOfWeekInMonth(ctx, n)); break;
        case 'g': rnd.add('mjulian-day', this.modifiedJulianDay(ctx, n)); break;
        case 'E': rnd.add('weekday', this.weekday(ctx, n)); break;
        case 'e': rnd.add('weekday', this.weekdayLocal(ctx, n)); break;
        case 'c': rnd.add('weekday', this.weekdayLocalStandalone(ctx, n)); break;
        case 'a': rnd.add('dayperiod', this.dayPeriod(ctx, n)); break;
        case 'b': rnd.add('dayperiod', this.dayPeriodExt(ctx, n)); break;
        case 'B': rnd.add('dayperiod', this.dayPeriodFlex(ctx, n)); break;

        case 'h':
        case 'H': rnd.add('hour', this.hour(ctx, n)); break;

        case 'K':
        case 'k': rnd.add('hour', this.hourAlt(ctx, n)); break;

        // 'j', 'J', 'C' - input skeleton symbols, not present in formats

        case 'm': rnd.add('minute', this.minute(ctx, n)); break;
        case 's': rnd.add('second', this.second(ctx, n)); break;
        case 'S': rnd.add('fracsec', this.fractionalSecond(ctx, n)); break;
        case 'A': rnd.add('millis-in-day', this.millisInDay(ctx, n)); break;

        case 'z': rnd.add('timezone', this.timezone_z(ctx, n)); break;
        case 'Z': rnd.add('timezone', this.timezone_Z(ctx, n)); break;
        case 'O': rnd.add('timezone', this.timezone_O(ctx, n)); break;
        case 'v': rnd.add('timezone', this.timezone_v(ctx, n)); break;
        case 'V': rnd.add('timezone', this.timezone_V(ctx, n)); break;

        case 'X':
        case 'x': rnd.add('timezone', this.timezone_x(ctx, n)); break;
      }
    }
  }

  /**
   * Format a number using the main numbering system, with the given minimum integers.
   */
  _num(ctx: CalendarContext<T>, n: number, minInt: number): string {
    return ctx.system.formatString(n, false, minInt);
  }

  era(ctx: CalendarContext<T>, width: number): string {
    const key1 = width ===  5 ? 'narrow' : width === 4 ? 'names' : 'abbr';
    return this.cal.eras.get(ctx.bundle, key1, `${ctx.date.era()}`);
  }

  year(ctx: CalendarContext<T>, width: number): string {
    return this._year(ctx, ctx.date.year(), width);
  }

  yearOfWeekYear(ctx: CalendarContext<T>, width: number): string {
    return this._year(ctx, ctx.date.yearOfWeekOfYear(), width);
  }

  extendedYear(ctx: CalendarContext<T>, width: number): string {
    return this._num(ctx, ctx.date.extendedYear(), width);
  }

  /**
   * Cyclic year.
   */
  cyclicYear(ctx: CalendarContext<T>, width: number): string {
    // TODO: Supported in Chinese calendar.
    return '';
  }

  /**
   * Related Gregorian year.
   */
  relatedYear(ctx: CalendarContext<T>, width: number): string {
    // Note: this is always rendered using 'latn' digits
    return ctx.latnSystem.formatString(ctx.date.relatedYear(), false, width);
  }

  _year(ctx: CalendarContext<T>, year: number, width: number): string {
    return this._num(ctx, width === 2 ? year % 100 : year, width);
  }

  _formatQuarterOrMonth(ctx: CalendarContext<T>,
      format: Vector2Arrow<string, string>, value: number, width: number): string {
    return width >= 3 ? format.get(ctx.bundle, widthKey1(width), String(value)) : this._num(ctx, value, width);
  }

  quarter(ctx: CalendarContext<T>, node: [string, number]): string {
    const [field, width] = node;
    const format = field === 'Q' ? this.cal.format : this.cal.standAlone;
    const quarters = format.quarters;
    const quarter = ((ctx.date.month() - 1 ) / 3 | 0) + 1;
    return this._formatQuarterOrMonth(ctx, quarters, quarter, width);
  }

  month(ctx: CalendarContext<T>, node: [string, number]): string {
    const format = node[0] === 'M' ? this.cal.format : this.cal.standAlone;
    return this._formatQuarterOrMonth(ctx, format.months, ctx.date.month(), node[1]);
  }

  weekOfWeekYear(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._num(ctx, ctx.date.weekOfYear(), min(node[1], 2));
  }

  weekOfMonth(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._num(ctx, ctx.date.weekOfMonth(), 1);
  }

  dayOfMonth(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._num(ctx, ctx.date.dayOfMonth(), min(node[1], 2));
  }

  dayOfYear(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._num(ctx, ctx.date.dayOfYear(), min(node[1], 3));
  }

  dayOfWeekInMonth(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._num(ctx, ctx.date.dayOfWeekInMonth(), 1);
  }

  modifiedJulianDay(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._num(ctx, ctx.date.modifiedJulianDay(), node[1]);
  }

  weekday(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._weekday(ctx.bundle, this.cal.format.weekdays, ctx.date, node[1]);
  }

  weekdayLocal(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._weekdayLocal(ctx, node, false);
  }

  weekdayLocalStandalone(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._weekdayLocal(ctx, node, true);
  }

  _weekday(bundle: Bundle, format: Vector2Arrow<string, string>, date: CalendarDate, width: number): string {
    const key2 = String(date.dayOfWeek());
    let key1 = 'abbreviated';
    switch (width) {
    case 6: key1 = 'short'; break;
    case 5: key1 = 'narrow'; break;
    case 4: key1 = 'wide'; break;
    }
    return format.get(bundle, key1, key2);
  }

  _weekdayLocal(ctx: CalendarContext<T>, node: [string, number], standAlone: boolean): string {
    const { bundle, date } = ctx;
    let width = node[1];
    if (width > 2) {
      const format = standAlone ? this.cal.standAlone : this.cal.format;
      return this._weekday(bundle, format.weekdays, date, width);
    }
    const ord = date.ordinalDayOfWeek();
    if (standAlone) {
      width = 1;
    }
    return ctx.system.formatString(ord, false, width);
  }

  dayPeriod(ctx: CalendarContext<T>, node: [string, number]): string {
    return this.cal.format.dayPeriods.get(ctx.bundle, widthKey1(node[1]), ctx.date.hourOfDay() < 12 ? 'am' : 'pm');
  }

  dayPeriodExt(ctx: CalendarContext<T>, node: [string, number]): string {
    const { bundle, date } = ctx;
    const key1 = widthKey1(node[1]);
    const key2 = date.isAM() ? 'am' : 'pm';
    let key2ext = key2;
    if (date.minute() === 0) {
      const hour = date.hourOfDay();
      key2ext = hour === 0 ? 'midnight' : hour === 12 ? 'noon' : key2;
    }
    const format = this.cal.format.dayPeriods;
    // Try extended and if it doesn't exist fall back to am/pm
    return format.get(bundle, key1, key2ext) || format.get(bundle, key1, key2);
  }

  dayPeriodFlex(ctx: CalendarContext<T>, node: [string, number]): string {
    const { bundle, date } = ctx;
    const minutes = (date.hourOfDay() * 60) + date.minute();
    const key2 = this.internals.calendars.flexDayPeriod(bundle, minutes);
    let res = '';
    if (key2) {
      res = this.cal.format.dayPeriods.get(bundle, widthKey1(node[1]), key2);
    }
    return res ? res : this.dayPeriodExt(ctx, node);
  }

  hour(ctx: CalendarContext<T>, node: [string, number]): string {
    const { date } = ctx;
    const twelve = node[0] === 'h';
    let hour = twelve ? date.hour() : date.hourOfDay();
    if (twelve && hour === 0) {
      hour = 12;
    }
    return this._num(ctx, hour, min(node[1], 2));
  }

  hourAlt(ctx: CalendarContext<T>, node: [string, number]): string {
    const { date } = ctx;
    const twelve = node[0] === 'K';
    let hour = twelve ? date.hour() : date.hourOfDay();
    if (!twelve && hour === 0) {
      hour = 24;
    }
    return this._num(ctx, hour, min(node[1], 2));
  }

  minute(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._num(ctx, ctx.date.minute(), min(node[1], 2));
  }

  second(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._num(ctx, ctx.date.second(), min(node[1], 2));
  }

  fractionalSecond(ctx: CalendarContext<T>, node: [string, number]): string {
    let w = node[1];
    let m = ctx.date.milliseconds();
    const d = w > 3 ? w - 3 : 0;
    w -= d;
    if (d > 0) {
      m *= Math.pow(10, d);
    }
    // Milliseconds always have precision of 3, so handle the cases compactly.
    const n = w === 3 ? m : (w === 2 ? (m / 10) : (m / 100)) | 0;
    return this._num(ctx, n, node[1]);
  }

  millisInDay(ctx: CalendarContext<T>, node: [string, number]): string {
    return this._num(ctx, ctx.date.millisecondsInDay(), node[1]);
  }

  /**
   * Timezone: short/long specific non-location format.
   * https://www.unicode.org/reports/tr35/tr35-dates.html#dfst-zone
   */
  timezone_z(ctx: CalendarContext<T>, node: [string, number]): string {
    if (node[1] > 4) {
      return '';
    }
    const key2 = ctx.date.metaZoneId();
    if (key2) {
      const { long, short } = this.tz.metaZones;
      const format = node[1] === 4 ? long : short;
      const name = format.get(ctx.bundle, ctx.date.isDaylightSavings() ? 'daylight' : 'standard', key2);
      if (name) {
        return name;
      }
    }
    return this.timezone_O(ctx, node);
  }

  /**
   * Timezone: ISO8601 basic/extended format, long localized GMT format.
   * https://www.unicode.org/reports/tr35/tr35-dates.html#dfst-zone
   */
  timezone_Z(ctx: CalendarContext<T>, node: [string, number]): string {
    const width = node[1];
    if (width === 4) {
      return this.timezone_O(ctx, ['O', width]);
    }

    const [_, negative, hours, minutes] = getTZC(ctx.date.timeZoneOffset());
    let fmt = '';
    if (width <= 5) {
      // TODO: use number params
      fmt += negative ? '-' : '+';
      fmt += this._num(ctx, hours, 2);
      if (width === 5) {
        fmt += ':';
      }
      fmt += this._num(ctx, minutes, 2);
    }
    return fmt;
  }

  /**
   * Timezone: short/long localized GMT format.
   */
  timezone_O(ctx: CalendarContext<T>, node: [string, number]): string {
    return node[1] === 1 || node[1] === 4 ? this._wrapGMT(ctx, node[1] === 1) : '';
  }

  /**
   * Timezone: short/long generic non-location format.
   */
  timezone_v(ctx: CalendarContext<T>, node: [string, number]): string {
    const width = node[1];
    if (width !== 1 && width !== 4) {
      return '';
    }
    let name = '';
    const key = ctx.date.metaZoneId();
    if (key) {
      const { long, short } = this.tz.metaZones;
      const format = width === 1 ? short : long;
      name = format.get(ctx.bundle, 'generic', key);
    }
    return name ? name : this.timezone_O(ctx, ['O', width]);
  }

  /**
   * Timezone: short/long zone ID, exemplar city, generic location format.
   * https://www.unicode.org/reports/tr35/tr35-dates.html#dfst-zone
   */
  timezone_V(ctx: CalendarContext<T>, node: [string, number]): string {
    const { bundle } = ctx;
    const zoneId = ctx.date.timeZoneId() as TimeZoneType;
    const exemplarCity = this.tz.exemplarCity;
    let city = '';
    switch (node[1]) {
    case 4:
      city = exemplarCity.get(bundle, zoneId);
      if (!city) {
        return this.timezone_O(ctx, ['O', 4]);
      }
      const pattern = this.tz.regionFormat.get(bundle);
      return this.wrapper.format(pattern, [city]);

    case 3:
      // Exemplar city for the timezone.
      city = exemplarCity.get(bundle, zoneId);
      return city ? city : exemplarCity.get(bundle, 'Etc/Unknown');

    case 2:
      return zoneId;

    case 1:
      return 'unk';
    }
    return '';
  }

  /**
   * Timezone: ISO8601 basic format
   * https://www.unicode.org/reports/tr35/tr35-dates.html#dfst-zone
   */
  timezone_x(ctx: CalendarContext<T>, node: [string, number]): string {
    const [field, width] = node;
    const [offset, negative, hours, minutes] = getTZC(ctx.date.timeZoneOffset());
    let fmt = '';
    if (width >= 1 && width <= 5) {
      fmt += negative ? '-' : '+';
      fmt += this._num(ctx, hours, 2);
      if (width === 3 || width === 5) {
        fmt += ':';
      }
      if (width !== 1 || minutes > 0) {
        fmt += this._num(ctx, minutes, 2);
      }
      if (field === 'X' && offset === 0) {
        fmt += 'Z';
      }
    }
    return fmt;
  }

  _wrapGMT(ctx: CalendarContext<T>, short: boolean): string {
    const { bundle, date } = ctx;
    const _offset = date.timeZoneOffset();
    if (_offset === 0) {
      return this.tz.gmtZeroFormat.get(bundle);
    }
    const [offset, negative, hours, minutes] = getTZC(_offset);
    const emitMins = !short || minutes > 0;
    const hourPattern =  this._hourPattern(bundle, negative);
    let fmt = '';
    for (const n of hourPattern) {
      if (typeof n === 'string') {
        const sep = n === '.' || n === ':';
        if (!sep || emitMins) {
          fmt += n;
        }
      } else {
        const [field, width] = n;
        if (field === 'H') {
          fmt += width === 1 ? this._num(ctx, hours, 1) : this._num(ctx, hours, short ? 1 : width);
        } else if (field === 'm' && emitMins) {
          fmt += this._num(ctx, minutes, width);
        }
      }
    }

    const wrap = this.tz.gmtFormat.get(bundle);
    return this.wrapper.format(wrap, [fmt]);
  }

  _hourPattern(bundle: Bundle, negative: boolean): DateTimeNode[] {
    const raw = this.tz.hourFormat.get(bundle);
    return this.internals.calendars.getHourPattern(raw, negative);
  }
}

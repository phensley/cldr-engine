import {
  CalendarSchema,
  ContextTransformFieldType,
  TimeZoneSchema,
  Vector2Arrow
} from '@phensley/cldr-types';

import { GeneralInternals } from '../../internals/internals';
import { Bundle } from '../../resource/bundle';
import { Internals } from '../internals';
import { CalendarDate } from '../../systems/calendars';
import { DateTimeNode } from '../../parsing/date';
import { AbstractValue } from '../../utils/render';
import { CalendarContext, CalendarFormatter } from './formatter';

const min = Math.min;

type TZC = [number, boolean, number, number];

const getTZC = (offset: number): TZC => {
  const negative = offset < 0;
  if (negative) {
    offset *= -1;
  }
  offset /= 60000;
  const hours = offset / 60 | 0;
  const minutes = offset % 60 | 0;
  return [offset, negative, hours, minutes];
};

const widthKey1 = (w: number) => w === 5 ? 'narrow' : w === 4 ? 'wide' : 'abbreviated';

/**
 * Format a number using the main numbering system, with the given minimum integers.
 */
const _num = <T extends CalendarDate>(ctx: CalendarContext<T>, n: number, minInt: number): string =>
  ctx.system.formatString(n, false, minInt);

const _year = <T extends CalendarDate>(ctx: CalendarContext<T>, year: number, width: number): string =>
  _num(ctx, width === 2 ? year % 100 : year, width);

export class CalendarFormatterImpl<T extends CalendarDate> implements CalendarFormatter<T> {

  private general: GeneralInternals;
  private tz: TimeZoneSchema;

  constructor(
    private internals: Internals,
    private cal: CalendarSchema
  ) {
    this.general = internals.general;
    this.tz = internals.schema.TimeZones;
  }

  format<R>(val: AbstractValue<R>, ctx: CalendarContext<T>, nodes: DateTimeNode[]): void {
    const len = nodes.length;
    for (let i = 0; i < len; i++) {
      const n = nodes[i];
      if (typeof n === 'string') {
        val.add('literal', n);
        continue;
      }

      const w = n[1];
      let field: ContextTransformFieldType | undefined;
      let type = '';
      let value = '';

      // Date field symbol table
      // https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table

      switch (n[0]) {

        // ERA
        case 'G':
          type = 'era';
          value = this.cal.eras.get(ctx.bundle,
            w ===  5 ? 'narrow' : w === 4 ? 'names' : 'abbr', `${ctx.date.era()}`);
          if (w !== 5) {
            field = w === 4 ? 'era-name' : 'era-abbr';
          }
          break;

        // YEAR
        case 'y':
          type = 'year';
          value = _year(ctx, ctx.date.year(), w);
          break;

        // YEAR IN WEEK OF YEAR
        case 'Y':
          type = 'year';
          value = _year(ctx, ctx.date.yearOfWeekOfYear(), w);
          break;

        // EXTENDED YEAR
        case 'u':
          type = 'year';
          value = _num(ctx, ctx.date.extendedYear(), w);
          break;

        // CYCLIC YEAR
        case 'U':
          type = 'cyclic-year';
          // TODO: support chinese cyclical years
          value = '';
          break;

        // RELATED YEAR
        case 'r':
          type = 'related-year';
          // Note: this is always rendered using 'latn' digits
          value = ctx.latnSystem.formatString(ctx.date.relatedYear(), false, w);
          break;

        // QUARTER
        case 'Q':
        case 'q':
          type = 'quarter';
          value = this.quarter(ctx, n);
          break;

        // MONTH FORMAT
        case 'M':
          type = 'month';
          value = this.month(ctx, n);
          switch (w) {
            case 3:
            case 4:
              field = 'month-format-except-narrow';
              break;
          }
          break;

        // MONTH STANDALONE
        case 'L':
          type = 'month';
          value = this.month(ctx, n);
          switch (w) {
            case 3:
            case 4:
              field = 'month-standalone-except-narrow';
              break;
          }
          break;

        // 'l' - deprecated

        // WEEK OF WEEK YEAR
        case 'w':
          type = 'week';
          value = _num(ctx, ctx.date.weekOfYear(), min(w, 2));
          break;

        // WEEK OF MONTH
        case 'W':
          type = 'week';
          value = _num(ctx, ctx.date.weekOfMonth(), 1);
          break;

        // DAY OF MONTH
        case 'd':
          type = 'day';
          value = _num(ctx, ctx.date.dayOfMonth(), min(w, 2));
          break;

        // DAY OF YEAR
        case 'D':
          type = 'day';
          value = _num(ctx, ctx.date.dayOfYear(), min(w, 3));
          break;

        // DAY OF WEEK IN MONTH
        case 'F':
          type = 'day';
          value = _num(ctx, ctx.date.dayOfWeekInMonth(), 1);
          break;

        // MODIFIED JULIAN DAY
        case 'g':
          type = 'mjulian-day';
          value = _num(ctx, ctx.date.modifiedJulianDay(), w);
          break;

        // WEEKDAY FORMAT
        case 'E':
          type = 'weekday';
          value = this._weekday(ctx.bundle, this.cal.format.weekdays, ctx.date, w);
          if (w !== 5) {
            field = 'day-format-except-narrow';
          }
          break;

        // WEEKDAY LOCAL
        case 'e':
          type = 'weekday';
          value = this._weekdayLocal(ctx, n, false);
          break;

        // WEEKDAY LOCAL STANDALONE
        case 'c':
          type = 'weekday';
          value = this._weekdayLocal(ctx, n, true);
          if (w !== 5) {
            field = 'day-standalone-except-narrow';
          }
          break;

        // DAY PERIOD AM/PM
        case 'a':
          type = 'dayperiod';
          value = this.cal.format.dayPeriods.get(ctx.bundle, widthKey1(w), ctx.date.hourOfDay() < 12 ? 'am' : 'pm');
          break;

        // DAY PERIOD EXTENDED
        case 'b':
          type = 'dayperiod';
          value = this.dayPeriodExt(ctx, n);
          break;

        // DAY PERIOD FLEXIBLE
        case 'B':
          type = 'dayperiod';
          value = this.dayPeriodFlex(ctx, n);
          break;

        // HOUR 1-12 and 0-23
        case 'h':
        case 'H':
          type = 'hour';
          value = this.hour(ctx, n);
          break;

        // HOUR 0-11 and 1-24
        case 'K':
        case 'k':
          type = 'hour';
          value = this.hourAlt(ctx, n);
          break;

        // 'j', 'J', 'C' - input skeleton symbols, not present in formats

        // MINUTE
        case 'm':
          type = 'minute';
          value = _num(ctx, ctx.date.minute(), min(w, 2));
          break;

        // SECOND
        case 's':
          type = 'second';
          value = _num(ctx, ctx.date.second(), min(w, 2));
          break;

        // FRACTIONAL SECOND
        case 'S':
          type = 'fracsec';
          value = this.fractionalSecond(ctx, n);
          break;

        // MILLISECONDS IN DAY
        case 'A':
          type = 'millis-in-day';
          value = _num(ctx, ctx.date.millisecondsInDay(), w);
          break;

        // TIMEZONE SPECIFIC NON-LOCATION
        case 'z':
          type = 'timezone';
          value = this.timezone_z(ctx, n);
          break;

        // TIMEZONE ISO-8601 EXTENDED
        case 'Z':
          type = 'timezone';
          value = this.timezone_Z(ctx, n);
          break;

        // TIMEZONE LOCALIZED
        case 'O':
          type = 'timezone';
          value = this.timezone_O(ctx, n);
          break;

        // TIMEZONE GENERIC NON-LOCATION
        case 'v':
          type = 'timezone';
          value = this.timezone_v(ctx, n);
          break;

        // TIMEZONE ID, EXEMPLAR CITY, GENERIC LOCATION
        case 'V':
          type = 'timezone';
          value = this.timezone_V(ctx, n);
          break;

        // TIMEZONE ISO-8601 BASIC, EXTENDED
        case 'X':
        case 'x':
          type = 'timezone';
          value = this.timezone_x(ctx, n);
          break;

        default:
          continue;
      }

      if (i === 0 && ctx.context && field) {
        value = this.internals.general.contextTransform(value, ctx.transform, ctx.context, field);
      }
      val.add(type, value);
    }
  }

  _formatQuarterOrMonth(ctx: CalendarContext<T>,
      format: Vector2Arrow<string, string>, value: number, width: number): string {
    return width >= 3 ?
      format.get(ctx.bundle, widthKey1(width), String(value)) :
      _num(ctx, value, width);
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
    return _num(ctx, hour, min(node[1], 2));
  }

  hourAlt(ctx: CalendarContext<T>, node: [string, number]): string {
    const { date } = ctx;
    const twelve = node[0] === 'K';
    let hour = twelve ? date.hour() : date.hourOfDay();
    if (!twelve && hour === 0) {
      hour = 24;
    }
    return _num(ctx, hour, min(node[1], 2));
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
    return _num(ctx, n, node[1]);
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

    const [ , negative, hours, minutes] = getTZC(ctx.date.timeZoneOffset());
    let fmt = '';
    if (width <= 5) {
      // TODO: use number params
      fmt += negative ? '-' : '+' ;
      fmt += _num(ctx, hours, 2);
      if (width === 5) {
        fmt += ':';
      }
      fmt += _num(ctx, minutes, 2);
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
    const stableId = ctx.date.timeZoneStableId();
    const exemplarCity = this.tz.exemplarCity;
    let city = '';
    switch (node[1]) {
    case 4:
      city = exemplarCity.get(bundle, stableId);
      if (!city) {
        return this.timezone_O(ctx, ['O', 4]);
      }
      const pattern = this.tz.regionFormat.get(bundle);
      return this.general.formatWrapper(pattern, [city]);

    case 3:
      // Exemplar city for the timezone.
      city = exemplarCity.get(bundle, stableId);
      return city ? city : exemplarCity.get(bundle, 'Etc/Unknown');

    case 2:
      const zoneId = ctx.date.timeZoneId();
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
      const zero = hours === 0 && minutes === 0;
      fmt += zero ? '+' : negative ? '-' : '+';
      fmt += _num(ctx, hours, 2);
      if (width === 3 || width === 5) {
        fmt += ':';
      }
      if (width !== 1 || minutes > 0) {
        fmt += _num(ctx, minutes, 2);
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
    const [ , negative, hours, minutes] = getTZC(_offset);

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
          fmt += width === 1 ? _num(ctx, hours, 1) : _num(ctx, hours, short ? 1 : width);
        } else if (field === 'm' && emitMins) {
          fmt += _num(ctx, minutes, width);
        }
      }
    }

    const wrap = this.tz.gmtFormat.get(bundle);
    return this.general.formatWrapper(wrap, [fmt]);
  }

  _hourPattern(bundle: Bundle, negative: boolean): DateTimeNode[] {
    const raw = this.tz.hourFormat.get(bundle);
    return this.internals.calendars.getHourPattern(raw, negative);
  }
}

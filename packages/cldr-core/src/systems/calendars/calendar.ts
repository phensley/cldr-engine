import { DateTimePatternField, DateTimePatternFieldType, MetaZoneType } from '@phensley/cldr-types';

import { dateFields, DateField, DayOfWeek } from './fields';
import { CalendarConstants } from './constants';
import { substituteZoneAlias, zoneInfoFromUTC, ZoneInfo } from './timezone';
import { INTERNAL_NUMBERING } from '../numbering';
import { timePeriodFieldFlags, TimePeriod, TimePeriodField, TimePeriodFieldFlag, TIME_PERIOD_FIELDS } from './interval';
import { CalendarDateFields, CalendarType } from './types';

const zeropad = (n: number, w: number): string => INTERNAL_NUMBERING.formatString(n, false, w);

export type CalendarDateModFields = keyof Pick<
  CalendarDateFields,
  'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
>;

/**
 * Implementation order, based on calendar preference data and ease of implementation.
 * https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/calendarPreferenceData.json
 *
 * Complete:
 *  gregorian           - widely used worldwide
 *  persian             - primary in AF, IR
 *  japanese            - secondary in JP, based on gregorian
 *  iso8601             - based on gregorian
 *  buddhist            - primary in TH
 *
 * Next:
 *  islamic-umalqura    - primary in SA
 *  chinese             - secondary in CN, CX, HK, MO, SG, TW
 *  islamic             - secondary in many locales
 *  dangi               - secondary in KO, based on chinese
 *
 * Rest TBD
 *
 * Calendar calculations are compatible with those in the Unicode ICU project.
 */

// Indicates a null field to support computing on demand
const NULL = Number.MAX_SAFE_INTEGER;

const { abs, floor } = Math;

const splitfrac = (n: number | undefined): [number, number] => {
  n = n || 0;
  const t = abs(n);
  const sign = n < 0 ? -1 : 1;
  const r = t | 0;
  return [sign * r, sign * (t - r)];
};

const relativeField = (p: TimePeriod): TimePeriodField => {
  for (const f of TIME_PERIOD_FIELDS) {
    if (p[f]) {
      return f;
    }
  }
  return 'millis';
};

/**
 * @internal
 */
export type CalendarFromUnixEpoch<T> = (epoch: number, zoneId: string, firstDay: number, minDays: number) => T;

const differenceFields: [number, DateTimePatternFieldType][] = [
  [DateField.ERA, DateTimePatternField.ERA],
  [DateField.YEAR, DateTimePatternField.YEAR],
  [DateField.MONTH, DateTimePatternField.MONTH],
  [DateField.DAY_OF_MONTH, DateTimePatternField.DAY],
  [DateField.AM_PM, DateTimePatternField.DAYPERIOD],
  [DateField.HOUR, DateTimePatternField.HOUR24],
  [DateField.MINUTE, DateTimePatternField.MINUTE],
  [DateField.SECOND, DateTimePatternField.SECOND],
];

/**
 * Base class for dates in supported calendars.
 *
 * @public
 */
export abstract class CalendarDate {
  // Forward reference for casting to Gregorian date
  protected static _gregorian: (d: CalendarDate, utc: boolean, firstDate: number, minDays: number) => CalendarDate;
  protected _fields: number[] = dateFields();
  protected _zoneInfo!: ZoneInfo;

  /**
   * Minimal fields required to construct any calendar date.
   */
  protected constructor(
    protected readonly _type: CalendarType,
    protected readonly _firstDay: number,
    protected readonly _minDays: number,
  ) {
    // Compute week fields on demand.
    this._fields[DateField.WEEK_OF_YEAR] = NULL;
    this._fields[DateField.YEAR_WOY] = NULL;
    this._zoneInfo = zoneInfoFromUTC('UTC', 0);
  }

  /**
   * Calendar type for this date, e.g. 'gregory' for Gregorian.
   *
   * @public
   */
  type(): CalendarType {
    return this._type;
  }

  /**
   * Returns a formatted ISO-8601 string of the date in UTC. Note that this
   * always returns a date in the Gregorian calendar.
   *
   * @public
   */
  toISOString(): string {
    return this._toISOString(this, true);
  }

  /**
   * Returns a formatted ISO 8601 string of the date with local timezone offset.
   * Note that this always returns a date in the Gregorian calendar.
   *
   * @public
   */
  toLocalISOString(): string {
    return this._toISOString(this, false);
  }

  /**
   * Unix epoch with no timezone offset.
   *
   * @public
   */
  unixEpoch(): number {
    return this._fields[DateField.LOCAL_MILLIS] - this._zoneInfo.offset;
  }

  /**
   * First day of week.
   *
   * @public
   */
  firstDayOfWeek(): number {
    return this._firstDay;
  }

  /**
   * Minimum days in the first week.
   *
   * @public
   */
  minDaysInFirstWeek(): number {
    return this._minDays;
  }

  /**
   * Returns a floating point number representing the real Julian Day, UTC.
   *
   * @public
   */
  julianDay(): number {
    const ms = (this._fields[DateField.MILLIS_IN_DAY] - this._zoneInfo.offset) / CalendarConstants.ONE_DAY_MS;
    return this._fields[DateField.JULIAN_DAY] - 0.5 + ms;
  }

  /**
   * CLDR's modified Julian day used as the basis for all date calculations.
   *
   * @public
   */
  modifiedJulianDay(): number {
    return this._fields[DateField.JULIAN_DAY];
  }

  /**
   * Era
   *
   * @public
   */
  era(): number {
    return this._fields[DateField.ERA];
  }

  /**
   * Extended year.
   *
   * @public
   */
  extendedYear(): number {
    return this._fields[DateField.EXTENDED_YEAR];
  }

  /**
   * Year.
   *
   * @public
   */
  year(): number {
    return this._fields[DateField.YEAR];
  }

  /**
   * Related year.
   *
   * @public
   */
  relatedYear(): number {
    return this._fields[DateField.EXTENDED_YEAR];
  }

  /**
   * Year of week of year.
   *
   * @public
   */
  yearOfWeekOfYear(): number {
    this.computeWeekFields();
    return this._fields[DateField.YEAR_WOY];
  }

  /**
   * Week of year.
   *
   * @public
   */
  weekOfYear(): number {
    this.computeWeekFields();
    return this._fields[DateField.WEEK_OF_YEAR];
  }

  /**
   * Year of week of year ISO.
   *
   * @public
   */
  yearOfWeekOfYearISO(): number {
    this.computeWeekFields();
    return this._fields[DateField.ISO_YEAR_WOY];
  }

  /**
   * Week of year ISO.
   *
   * @public
   */
  weekOfYearISO(): number {
    this.computeWeekFields();
    return this._fields[DateField.ISO_WEEK_OF_YEAR];
  }

  /**
   * Ordinal month, one-based, e.g. Gregorian JANUARY = 1.
   */
  month(): number {
    return this._fields[DateField.MONTH];
  }

  /**
   * Returns the week of the month computed using the locale's 'first day
   * of week' and 'minimal days in first week' where applicable.
   *
   * For example, for the United States, weeks start on Sunday.
   * Saturday 9/1/2018 would be in week 1, and Sunday 9/2/2018 would
   * begin week 2.
   *
   *         September
   *   Su Mo Tu We Th Fr Sa
   *                      1
   *    2  3  4  5  6  7  8
   *    9 10 11 12 13 14 15
   *   16 17 18 19 20 21 22
   *   23 24 25 26 27 28 29
   *   30
   */
  weekOfMonth(): number {
    this.computeWeekFields();
    return this._fields[DateField.WEEK_OF_MONTH];
  }

  dayOfYear(): number {
    return this._fields[DateField.DAY_OF_YEAR];
  }

  /**
   * Day of the week. 1 = SUNDAY, 2 = MONDAY, ..., 7 = SATURDAY
   */
  dayOfWeek(): number {
    return this._fields[DateField.DAY_OF_WEEK];
  }

  /**
   * Ordinal day of the week. 1 if this is the 1st day of the week,
   * 2 if the 2nd, etc. Depends on the local starting day of the week.
   */
  ordinalDayOfWeek(): number {
    const weekday = this.dayOfWeek();
    const firstDay = this.firstDayOfWeek();
    return ((7 - firstDay + weekday) % 7) + 1;
  }

  /**
   * Ordinal number indicating the day of the week in the current month.
   * The result of this method can be used to format messages like
   * "2nd Sunday in August".
   */
  dayOfWeekInMonth(): number {
    this.computeWeekFields();
    return this._fields[DateField.DAY_OF_WEEK_IN_MONTH];
  }

  /**
   * Day of month.
   *
   * @public
   */
  dayOfMonth(): number {
    return this._fields[DateField.DAY_OF_MONTH];
  }

  /**
   * Is AM.
   *
   * @public
   */
  isAM(): boolean {
    return this._fields[DateField.AM_PM] === 0;
  }

  /**
   * Indicates the hour of the morning or afternoon, used for the 12-hour
   * clock (0 - 11). Noon and midnight are 0, not 12.
   */
  hour(): number {
    return this._fields[DateField.HOUR];
  }

  /**
   * Indicates the hour of the day, used for the 24-hour clock (0 - 23).
   * Noon is 12 and midnight is 0.
   */
  hourOfDay(): number {
    return this._fields[DateField.HOUR_OF_DAY];
  }

  /**
   * Indicates the minute of the hour (0 - 59).
   */
  minute(): number {
    return this._fields[DateField.MINUTE];
  }

  /**
   * Indicates the second of the minute (0 - 59).
   */
  second(): number {
    return this._fields[DateField.SECOND];
  }

  /**
   * Milliseconds.
   *
   * @public
   */
  milliseconds(): number {
    return this._fields[DateField.MILLIS];
  }

  /**
   * Milliseconds in day.
   *
   * @public
   */
  millisecondsInDay(): number {
    return this._fields[DateField.MILLIS_IN_DAY];
  }

  /**
   * Metazone (CLDR) identifier.
   *
   * @public
   */
  metaZoneId(): MetaZoneType {
    return this._zoneInfo.metazoneid as MetaZoneType;
  }

  /**
   * Timezone identifier.
   *
   * @public
   */
  timeZoneId(): string {
    return this._zoneInfo.zoneid;
  }

  /**
   * Timezone stable identifier (CLDR)
   *
   * @public
   */
  timeZoneStableId(): string {
    return this._zoneInfo.stableid;
  }

  /**
   * Timezone offset
   *
   * @public
   */
  timeZoneOffset(): number {
    return this._zoneInfo.offset;
  }

  /**
   * Is leap year.
   *
   * @public
   */
  isLeapYear(): boolean {
    return this._fields[DateField.IS_LEAP] === 1;
  }

  /**
   * Is daylight savings time.
   *
   * @public
   */
  isDaylightSavings(): boolean {
    return this._zoneInfo.dst === 1;
  }

  /**
   * Computes the field of visual difference between the two dates.
   * Note: This assumes the dates are of the same type and have the same
   * timezone offset.
   *
   * @public
   */
  fieldOfVisualDifference(other: CalendarDate): DateTimePatternFieldType | undefined {
    const a = this._fields;
    const b = other._fields;
    for (const [key, field] of differenceFields) {
      if (a[key] !== b[key]) {
        return field;
      }
    }
    return undefined;
  }

  /**
   * Compare two dates a and b, returning:
   *
   * ```
   *   a < b  ->  -1
   *   a = b  ->  0
   *   a > b  ->  1
   * ```
   *
   * @public
   */
  compare(other: CalendarDate): number {
    const a = this.unixEpoch();
    const b = other.unixEpoch();
    return a < b ? -1 : a > b ? 1 : 0;
  }

  /**
   * Calculate the relative time between two dates. If a field is specified
   * the time will be calculated in terms of that single field. Otherwise
   * the field of greatest difference will be used.
   *
   * @public
   */
  relativeTime(other: CalendarDate, field?: TimePeriodField): [TimePeriodField, number] {
    const [s, sf, , ef] = this.swap(other);
    const d = this._diff(s, sf, ef);
    const _field = field || relativeField(d);
    const r = this._rollup(d, sf, ef, [_field]);
    return [_field, r[_field] || 0];
  }

  /**
   * Calculate the time period between two dates. Note this returns the
   * absolute value of the difference.
   *
   * @public
   */
  difference(other: CalendarDate, fields?: TimePeriodField[]): TimePeriod {
    const [s, sf, , ef] = this.swap(other);
    const d = this._diff(s, sf, ef);
    return fields ? this._rollup(d, sf, ef, fields) : d;
  }

  /**
   * Calculate the time period between two dates. If 'other' is before this date,
   * the time period fields will be negative.
   *
   * @public
   */
  differenceSigned(other: CalendarDate, fields?: TimePeriodField[]): TimePeriod {
    const r = this.difference(other, fields);
    return other.compare(this) < 0 ? (this._invertPeriod(r) as TimePeriod) : r;
  }

  /**
   * Return all of the date and time field values.
   *
   * @public
   */
  fields(): CalendarDateFields {
    return {
      year: this.extendedYear(),
      month: this.month(),
      day: this.dayOfMonth(),
      hour: this.hourOfDay(),
      minute: this.minute(),
      second: this.second(),
      millis: this.milliseconds(),
      zoneId: this.timeZoneId(),
    };
  }

  /**
   * Return a JavaScript Date object with the same date and time.
   *
   * @public
   */
  asJSDate(): Date {
    return new Date(this.toLocalISOString());
  }

  /**
   * Start of date, e.g. `date.startOf('day')`
   *
   * @public
   */
  startOf(field: CalendarDateModFields): CalendarDate {
    switch (field) {
      case 'year':
        return this.set({
          month: 0,
          day: 0,
          hour: 0,
          minute: 0,
          second: 0,
          millis: 0,
        });
      case 'month':
        return this.set({ day: 0, hour: 0, minute: 0, second: 0, millis: 0 });
      case 'day':
        return this.set({ hour: 0, minute: 0, second: 0, millis: 0 });
      case 'hour':
        return this.set({ minute: 0, second: 0, millis: 0 });
      case 'minute':
        return this.set({ second: 0, millis: 0 });
      case 'second':
        return this.set({ millis: 0 });
    }
  }

  /**
   * End of date, e.g. `date.endOf('day')`
   *
   * @public
   */
  endOf(field: CalendarDateModFields): CalendarDate {
    switch (field) {
      case 'year':
        return this.set({
          month: 13,
          day: 32,
          hour: 23,
          minute: 59,
          second: 59,
          millis: 999,
        });
      case 'month':
        return this.set({
          day: 32,
          hour: 23,
          minute: 59,
          second: 59,
          millis: 999,
        });
      case 'day':
        return this.set({ hour: 23, minute: 59, second: 59, millis: 999 });
      case 'hour':
        return this.set({ minute: 59, second: 59, millis: 999 });
      case 'minute':
        return this.set({ second: 59, millis: 999 });
      case 'second':
        return this.set({ millis: 999 });
    }
  }

  /**
   * Set one or more fields on this date explicitly, and return a new date.
   *
   * Note: when setting the 'year' field you must use the "extended year".
   * For example, the extended year 0 is 1 B.C in the Gregorian calendar.
   *
   * @public
   */
  abstract set(fields: Partial<CalendarDateFields>): CalendarDate;

  /**
   * Add the fields to this date, returning a new date.
   *
   * @public
   */
  abstract add(fields: Partial<TimePeriod>): CalendarDate;

  /**
   * Subtract the fields from this date, returning a new date.
   *
   * @public
   */
  abstract subtract(fields: Partial<TimePeriod>): CalendarDate;

  /**
   * Change the timezone for this date, returning a new date.
   *
   * @public
   */
  abstract withZone(zoneId: string): CalendarDate;

  protected abstract _new(): CalendarDate;
  protected abstract initFields(f: number[]): void;
  protected abstract monthCount(): number;
  protected abstract daysInMonth(y: number, m: number): number;
  protected abstract daysInYear(y: number): number;
  protected abstract monthStart(eyear: number, month: number, useMonth: boolean): number;

  protected _toISOString(d: CalendarDate, utc: boolean): string {
    d = CalendarDate._gregorian(this, utc, this._firstDay, this._minDays);
    let z = 'Z';
    if (!utc) {
      const o = (this.timeZoneOffset() / CalendarConstants.ONE_MINUTE_MS) | 0;
      z = `${o < 0 ? '-' : '+'}${zeropad((o / 60) | 0, 2)}:${zeropad(o % 60 | 0, 2)}`;
    }
    const y = d.extendedYear();
    const neg = y < 0;
    return (
      `${neg ? '-' : ''}${zeropad(Math.abs(y), 4)}-${zeropad(d.month(), 2)}-${zeropad(d.dayOfMonth(), 2)}` +
      `T${zeropad(d.hourOfDay(), 2)}:${zeropad(d.minute(), 2)}:${zeropad(d.second(), 2)}` +
      `.${zeropad(d.milliseconds(), 3)}${z}`
    );
  }

  /**
   * Rollup just the time fields into number of milliseconds. This is internal
   * and assumes all time fields are defined.
   */
  protected _timeToMs(f: Partial<CalendarDateFields>): number {
    return (
      clamp(f.hour || 0, 0, 23) * CalendarConstants.ONE_HOUR_MS +
      clamp(f.minute || 0, 0, 59) * CalendarConstants.ONE_MINUTE_MS +
      clamp(f.second || 0, 0, 59) * CalendarConstants.ONE_SECOND_MS +
      clamp(f.millis || 0, 0, 999)
    );
  }

  protected _invertPeriod(fields: Partial<TimePeriod>): Partial<TimePeriod> {
    const r: Partial<TimePeriod> = {};
    for (const f of TIME_PERIOD_FIELDS) {
      const v = fields[f];
      r[f] = v ? -v : 0;
    }
    return r;
  }

  /**
   * Roll up time period fields into a subset of fields.
   */
  protected _rollup(span: Partial<TimePeriod>, sf: number[], ef: number[], fields: TimePeriodField[]): TimePeriod {
    const f = timePeriodFieldFlags(fields);
    if (!f) {
      return { year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0, millis: 0, ...span };
    }

    const mc = this.monthCount();

    let year = span.year || 0;
    let month = span.month || 0;
    let day = (span.week || 0) * 7 + (span.day || 0);
    let ms =
      (span.hour || 0) * CalendarConstants.ONE_HOUR_MS +
      (span.minute || 0) * CalendarConstants.ONE_MINUTE_MS +
      (span.second || 0) * CalendarConstants.ONE_SECOND_MS +
      (span.millis || 0);

    if (f & TimePeriodFieldFlag.YEAR && f & TimePeriodFieldFlag.MONTH) {
      // Both year and month were requested, so use their integer values.
    } else if (f & TimePeriodFieldFlag.MONTH) {
      // Month was requested so convert years into months
      month += year * mc;
      year = 0;
    } else if (f & TimePeriodFieldFlag.YEAR && month) {
      // Year was requested so convert months into days

      // This is a little verbose but necessary to accurately convert
      // months into days.  Example:
      //
      //  2001-03-11  and 2001-09-09   5 months and 29 days apart
      //  == (last month days) + (full month days) + (first month days)
      //  == 9 + 31 + 31 + 30 + 31 + 30 + (31 - 11)
      //  == 182 days

      let endy = ef[DateField.EXTENDED_YEAR];
      let endm = ef[DateField.MONTH] - 1;

      // TODO: create a cursor for year/month calculations to reduce
      // the verbosity of this block

      // Subtract the number of days to find the "day of month"
      // relative to each of the months to be converted.
      let dom = ef[DateField.DAY_OF_MONTH] - day;
      if (dom < 0) {
        endm--;
        if (endm < 0) {
          endm += mc;
          endy--;
        }
        // const dim = this.daysInMonth(endy, endm);
        dom += this.daysInMonth(endy, endm);
      }

      // Convert each month except the last into days
      let tmpd = dom;
      while (month > 1) {
        endm--;
        if (endm < 0) {
          endm += mc;
          endy--;
        }
        tmpd += this.daysInMonth(endy, endm);
        month--;
      }

      // Convert the last month into days
      endm--;
      if (endm < 0) {
        endm += mc;
        endy--;
      }

      tmpd += this.daysInMonth(endy, endm) - dom;
      day += tmpd;
      month = 0;
    } else {
      // Neither year nor month were requested, so we ignore those parts
      // of the time period, and re-calculate the days directly from the
      // original date fields.
      day = ef[DateField.JULIAN_DAY] - sf[DateField.JULIAN_DAY];
      ms = ef[DateField.MILLIS_IN_DAY] - sf[DateField.MILLIS_IN_DAY];
      if (ms < 0) {
        day--;
        ms += CalendarConstants.ONE_DAY_MS;
      }
      year = month = 0;
    }

    // We have integer year, month, and millis computed at this point.

    ms += CalendarConstants.ONE_DAY_MS * day;
    day = 0;

    const onedy = CalendarConstants.ONE_DAY_MS;
    const onewk = onedy * 7;
    const onehr = CalendarConstants.ONE_HOUR_MS;
    const onemn = CalendarConstants.ONE_MINUTE_MS;

    let week = 0;
    let hour = 0;
    let minute = 0;
    let second = 0;
    let millis = 0;

    // Roll down

    if (f & TimePeriodFieldFlag.WEEK) {
      week = (ms / onewk) | 0;
      ms -= week * onewk;
    }
    if (f & TimePeriodFieldFlag.DAY) {
      day = (ms / onedy) | 0;
      ms -= day * onedy;
    }
    if (f & TimePeriodFieldFlag.HOUR) {
      hour = (ms / onehr) | 0;
      ms -= hour * onehr;
    }
    if (f & TimePeriodFieldFlag.MINUTE) {
      minute = (ms / onemn) | 0;
      ms -= minute * onemn;
    }
    if (f & TimePeriodFieldFlag.SECOND) {
      second = (ms / 1000) | 0;
      ms -= second * 1000;
    }
    if (f & TimePeriodFieldFlag.MILLIS) {
      millis = ms;
    }

    const dayms = ms / CalendarConstants.ONE_DAY_MS;

    // Roll up fractional

    if (f < TimePeriodFieldFlag.MONTH) {
      // Days in the last year before adding the remaining fields
      const diy = this.daysInYear(sf[DateField.EXTENDED_YEAR] + year);
      year += (day + dayms) / diy;
      day = 0;
    } else if (f < TimePeriodFieldFlag.WEEK) {
      let ey = ef[DateField.YEAR];
      let em = ef[DateField.MONTH] - 2;
      if (em < 0) {
        em += mc;
        ey--;
      }
      const dim = this.daysInMonth(ey, em);
      month += (day + dayms) / dim;
    } else if (f < TimePeriodFieldFlag.DAY) {
      week += (day + dayms) / 7;
    } else if (f < TimePeriodFieldFlag.HOUR) {
      day += dayms;
    } else if (f < TimePeriodFieldFlag.MINUTE) {
      hour += ms / onehr;
    } else if (f < TimePeriodFieldFlag.SECOND) {
      minute += ms / onemn;
    } else if (f < TimePeriodFieldFlag.MILLIS) {
      second += ms / 1000;
    }

    return {
      year,
      month,
      week,
      day,
      hour,
      minute,
      second,
      millis,
    };
  }

  /**
   * Compute the number of years, months, days, etc, between two dates. The result will
   * have all fields as integers.
   */
  protected _diff(s: CalendarDate, sf: number[], ef: number[]): TimePeriod {
    // Use a borrow-based method to compute fields. If a field X is negative, we borrow
    // from the next-higher field until X is positive. Repeat until all fields are
    // positive.

    let millis = ef[DateField.MILLIS_IN_DAY] - sf[DateField.MILLIS_IN_DAY];
    let day = ef[DateField.DAY_OF_MONTH] - sf[DateField.DAY_OF_MONTH];
    let month = ef[DateField.MONTH] - sf[DateField.MONTH];
    let year = ef[DateField.EXTENDED_YEAR] - sf[DateField.EXTENDED_YEAR];

    // Convert days into milliseconds
    if (millis < 0) {
      millis += CalendarConstants.ONE_DAY_MS;
      day--;
    }

    // Convert months into days
    // This is a little more complex since months can have 28, 29 30 or 31 days.
    // We work backwards from the current month and successively convert months
    // into days until days are positive.
    const mc = s.monthCount();
    let m = ef[DateField.MONTH] - 1; // convert to 0-based month
    let y = ef[DateField.EXTENDED_YEAR];
    while (day < 0) {
      // move to previous month
      m--;
      // add back the number of days in the current month, wrapping around to December
      if (m < 0) {
        m += mc;
        y--;
      }
      const dim = this.daysInMonth(y, m);
      day += dim;
      month--;
    }

    // Convert years into months
    if (month < 0) {
      month += mc;
      year--;
    }

    // Convert days to weeks
    const week = day > 0 ? (day / 7) | 0 : 0;
    if (week > 0) {
      day -= week * 7;
    }

    // Break down milliseconds into components
    const hour = (millis / CalendarConstants.ONE_HOUR_MS) | 0;
    millis -= hour * CalendarConstants.ONE_HOUR_MS;
    const minute = (millis / CalendarConstants.ONE_MINUTE_MS) | 0;
    millis -= minute * CalendarConstants.ONE_MINUTE_MS;
    const second = (millis / CalendarConstants.ONE_SECOND_MS) | 0;
    millis -= second * CalendarConstants.ONE_SECOND_MS;

    return {
      year,
      month,
      week,
      day,
      hour,
      minute,
      second,
      millis,
    };
  }

  protected swap(other: CalendarDate): [CalendarDate, number[], CalendarDate, number[]] {
    let s = this as CalendarDate;
    let e = other;

    // Swap start/end dates
    if (this.compare(other) === 1) {
      [s, e] = [e, s];
    }

    // Convert start and end to UTC and ensure both are of the same calendar type.
    // We do this using lower-level logic since the CalendarDate base class currently
    // cannot construct instances of subclasses.
    return [s, s.utcfields(), e, e.utcfields()];
  }

  /**
   * Compute a new Julian day and milliseconds UTC by updating one or more fields.
   */
  protected _add(fields: Partial<TimePeriod>): [number, number] {
    const f = this.utcfields();

    let jd: number;
    let ms: number;
    let year: number;
    let yearf: number;

    let ydays: number;
    let ydaysf: number;

    let month: number;
    let monthf: number;

    let day: number;
    let dayf: number;

    let _days: number;
    let _ms: number;

    // Capture days and time fields (in milliseconds) for future use.
    // We do this here since we'll be re-initializing the date fields
    // below.
    [_days, _ms] = this._addTime(fields);
    _days += (fields.day || 0) + (fields.week || 0) * 7;

    // YEARS

    // Split off the fractional part of the years. Add the integer
    // years to the extended year. Then get the number of days in that
    // year and multiply that by the fractional part.
    // Example: In a Gregorian leap year we'll have 366 days. If the fractional
    // year is 0.25 we'll get 91.5 days.
    [year, yearf] = splitfrac(fields.year);
    year += f[DateField.EXTENDED_YEAR];
    [ydays, ydaysf] = splitfrac(this.daysInYear(year) * yearf);

    // Add day fractions from year calculation to milliseconds
    ms = ydaysf * CalendarConstants.ONE_DAY_MS;

    // Calculate the julian day for the year, month and day-of-month combination,
    // adding in the days due to fractional year
    jd = this.monthStart(year, f[DateField.MONTH] - 1, false) + f[DateField.DAY_OF_MONTH] + ydays;

    // Initialize fields from the julian day
    f[DateField.JULIAN_DAY] = jd;
    f[DateField.MILLIS_IN_DAY] = 0;
    this.initFields(f);

    year = f[DateField.EXTENDED_YEAR];

    // MONTHS

    // Get integer and fractional months
    month = fields.month || 0;
    [month, monthf] = splitfrac(f[DateField.MONTH] - 1 + month);

    // Add back years by dividing by month count
    const mc = this.monthCount();
    const [myears] = splitfrac(month / 12); // ignore fraction here
    month -= myears * mc;
    year += myears;

    // Take away a year if the month pointer went negative
    if (month < 0) {
      month += mc;
      year--;
    }

    // Compute updated julian day from year and fractional month
    const dim = this.daysInMonth(year, month) * monthf;
    [day, dayf] = splitfrac(_days + dim);
    jd = this.monthStart(year, month, false) + f[DateField.DAY_OF_MONTH];

    // DAY AND TIME FIELDS

    // Adjust julian day by fractional day and time fields
    ms += Math.round(_ms + dayf * CalendarConstants.ONE_DAY_MS);
    if (ms >= CalendarConstants.ONE_DAY_MS) {
      const d = floor(ms / CalendarConstants.ONE_DAY_MS);
      ms -= d * CalendarConstants.ONE_DAY_MS;
      day += d;
    }

    return [jd + day, ms];
  }

  /**
   * Converts all time fields into [days, milliseconds].
   */
  protected _addTime(fields: Partial<TimePeriod>): [number, number] {
    // Calculate the time difference in days and milliseconds
    let msDay = this._fields[DateField.MILLIS_IN_DAY] - this.timeZoneOffset();
    msDay +=
      (fields.hour || 0) * CalendarConstants.ONE_HOUR_MS +
      (fields.minute || 0) * CalendarConstants.ONE_MINUTE_MS +
      (fields.second || 0) * CalendarConstants.ONE_SECOND_MS +
      (fields.millis || 0);
    const oneDay = CalendarConstants.ONE_DAY_MS;
    const days = floor(msDay / oneDay);
    const ms = msDay - days * oneDay;
    return [days, ms];
  }

  protected initFromUnixEpoch(ms: number, zoneId: string): void {
    zoneId = substituteZoneAlias(zoneId);
    this._zoneInfo = zoneInfoFromUTC(zoneId, ms);
    jdFromUnixEpoch(ms + this._zoneInfo.offset, this._fields);
    computeBaseFields(this._fields);
  }

  protected initFromJD(jd: number, msDay: number, zoneId: string): void {
    const unixEpoch = unixEpochFromJD(jd, msDay);
    this.initFromUnixEpoch(unixEpoch, zoneId);
  }

  protected _toString(type: string): string {
    const y = this.extendedYear();
    const neg = y < 0;
    return (
      `${type} ${neg ? '-' : ''}${zeropad(Math.abs(y), 4)}` +
      `-${zeropad(this.month(), 2)}-${zeropad(this.dayOfMonth(), 2)} ` +
      `${zeropad(this.hourOfDay(), 2)}:${zeropad(this.minute(), 2)}:${zeropad(this.second(), 2)}` +
      `.${zeropad(this.milliseconds(), 3)} ${this._zoneInfo.zoneid}`
    );
  }

  /**
   * Compute WEEK_OF_YEAR and YEAR_WOY on demand.
   */
  protected computeWeekFields(): void {
    const f = this._fields;
    if (f[DateField.YEAR_WOY] !== NULL) {
      return;
    }

    const dow = f[DateField.DAY_OF_WEEK];
    const dom = f[DateField.DAY_OF_MONTH];
    const doy = f[DateField.DAY_OF_YEAR];
    f[DateField.WEEK_OF_MONTH] = this.weekNumber(this._firstDay, this._minDays, dom, dom, dow);
    f[DateField.DAY_OF_WEEK_IN_MONTH] = (((dom - 1) / 7) | 0) + 1;

    // compute locale
    this._computeWeekFields(DateField.WEEK_OF_YEAR, DateField.YEAR_WOY, this._firstDay, this._minDays, dow, dom, doy);

    // compute ISO
    this._computeWeekFields(DateField.ISO_WEEK_OF_YEAR, DateField.ISO_YEAR_WOY, 2, 4, dow, dom, doy);
  }

  protected _computeWeekFields(
    woyfield: number,
    ywoyfield: number,
    firstDay: number,
    minDays: number,
    dow: number,
    _dom: number,
    doy: number,
  ): void {
    const f = this._fields;
    const eyear = f[DateField.EXTENDED_YEAR];

    let ywoy = eyear;
    const rdow = (dow + 7 - firstDay) % 7;
    const rdowJan1 = (dow - doy + 7001 - firstDay) % 7;
    let woy = floor((doy - 1 + rdowJan1) / 7);
    if (7 - rdowJan1 >= minDays) {
      woy++;
    }

    if (woy === 0) {
      const prevDay = doy + this.yearLength(eyear - 1);
      woy = this.weekNumber(firstDay, minDays, prevDay, prevDay, dow);
      ywoy--;
    } else {
      const lastDoy = this.yearLength(eyear);
      if (doy >= lastDoy - 5) {
        let lastRdow = (rdow + lastDoy - doy) % 7;
        if (lastRdow < 0) {
          lastRdow += 7;
        }
        if (6 - lastRdow >= minDays && doy + 7 - rdow > lastDoy) {
          woy = 1;
          ywoy++;
        }
      }
    }

    f[woyfield] = woy;
    f[ywoyfield] = ywoy;
  }

  protected yearLength(y: number): number {
    return this.monthStart(y + 1, 0, false) - this.monthStart(y, 0, false);
  }

  protected weekNumber(
    firstDay: number,
    minDays: number,
    desiredDay: number,
    dayOfPeriod: number,
    dayOfWeek: number,
  ): number {
    let psow = (dayOfWeek - firstDay - dayOfPeriod + 1) % 7;
    if (psow < 0) {
      psow += 7;
    }
    const weekNo = floor((desiredDay + psow - 1) / 7);
    return 7 - psow >= minDays ? weekNo + 1 : weekNo;
  }

  protected utcfields(): number[] {
    const u = this.unixEpoch();
    const f = this._fields.slice(0);
    jdFromUnixEpoch(u, f);
    computeBaseFields(f);
    this.initFields(f);
    return f;
  }
}

const clamp = (n: number, min: number, max: number): number => Math.max(Math.min(n, max), min) | 0;

/**
 * Compute Julian day from timezone-adjusted Unix epoch milliseconds.
 */
const jdFromUnixEpoch = (ms: number, f: number[]): void => {
  const oneDayMS = CalendarConstants.ONE_DAY_MS;
  const days = floor(ms / oneDayMS);
  const jd = days + CalendarConstants.JD_UNIX_EPOCH;
  const msDay = floor(ms - days * oneDayMS);

  f[DateField.JULIAN_DAY] = jd;
  f[DateField.MILLIS_IN_DAY] = msDay;
};

/**
 * Compute fields common to all calendars. Before calling this, we must
 * have the JULIAN_DAY and MILLIS_IN_DAY fields set. Every calculation
 * is relative to these.
 */
const computeBaseFields = (f: number[]): void => {
  const jd = clamp(f[DateField.JULIAN_DAY], CalendarConstants.JD_MIN, CalendarConstants.JD_MAX);
  // checkJDRange(jd);

  let msDay = f[DateField.MILLIS_IN_DAY];
  const ms = msDay + (jd - CalendarConstants.JD_UNIX_EPOCH) * CalendarConstants.ONE_DAY_MS;

  f[DateField.LOCAL_MILLIS] = ms;
  f[DateField.JULIAN_DAY] = jd;
  f[DateField.MILLIS_IN_DAY] = msDay;
  f[DateField.MILLIS] = msDay % 1000;

  msDay = (msDay / 1000) | 0;
  f[DateField.SECOND] = msDay % 60;

  msDay = (msDay / 60) | 0;
  f[DateField.MINUTE] = msDay % 60;

  msDay = (msDay / 60) | 0;
  f[DateField.HOUR_OF_DAY] = msDay;
  f[DateField.AM_PM] = (msDay / 12) | 0;
  f[DateField.HOUR] = msDay % 12;

  let dow = (jd + DayOfWeek.MONDAY) % 7;
  if (dow < DayOfWeek.SUNDAY) {
    dow += 7;
  }
  f[DateField.DAY_OF_WEEK] = dow;
};

// TODO: clamp range instead of throwing error.
// const checkJDRange = (jd: number): void => {
//   if (jd < CalendarConstants.JD_MIN || jd > CalendarConstants.JD_MAX) {
//     throw new Error(
//       `Julian day ${jd} is outside the supported range of this library: ` +
//         `${ConstantsDesc.JD_MIN} to ${ConstantsDesc.JD_MAX}`,
//     );
//   }
// };

/**
 * Given a Julian day and local milliseconds (in UTC), return the Unix
 * epoch milliseconds UTC.
 */
const unixEpochFromJD = (jd: number, msDay: number): number => {
  const days = jd - CalendarConstants.JD_UNIX_EPOCH;
  return days * CalendarConstants.ONE_DAY_MS + Math.round(msDay);
};

import { DateTimePatternField, DateTimePatternFieldType, MetaZoneType } from '@phensley/cldr-types';
import { getTZC } from '../../internals/calendars/zoneutil';
import { INTERNAL_NUMBERING } from '../numbering';
import { CalendarConstants } from './constants';
import { difference } from './difference';
import { DateField, dateFields } from './fields';
import { TIME_PERIOD_FIELDS, TimePeriod, TimePeriodField } from './interval';
import { clamp, initBaseFromUnixEpoch } from './math';
import { ZoneInfo, zoneInfoFromUTC } from './timezone';
import { CalendarDateFields, CalendarType } from './types';

const zeropad = (n: number, w: number): string => INTERNAL_NUMBERING.formatString(n, false, w);

export type CalendarDateModFields = keyof Pick<
  CalendarDateFields,
  'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
>;

/**
 * @public
 */
export interface TimeStringOptions {
  /**
   * Include timezone identifier.
   */
  includeZoneId?: boolean;

  /**
   * Include timezone offset.
   */
  includeZoneOffset?: boolean;

  /**
   * Only output milliseconds if non-zero.
   */
  optionalMilliseconds?: boolean;
}

export interface DateDiffOptions {
  /**
   * Calculate weeks.
   */
  includeWeeks?: boolean;

  /**
   * Rollup result into the given fields.
   */
  fields?: TimePeriodField[];

  /**
   * Rollup fractional fields.
   */
  rollupFractional?: boolean;
}

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

const { floor } = Math;

/**
 * Automatically select the best field to represent the time period.
 */
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
    return compare(this, other);
  }

  /**
   * Calculate the relative time between two dates. If a field is specified
   * the time will be calculated in terms of that single field. Otherwise
   * the field will be auto-selected.
   *
   * @public
   */
  relativeTime(other: CalendarDate, field?: TimePeriodField, options?: DateDiffOptions): [TimePeriodField, number] {
    options = options || {};
    let result: TimePeriod;

    // If no field is specified, calculate the difference in all fields and select the largest.
    if (field === undefined) {
      result = difference(this, other, { ...options, rollupFractional: false, fields: undefined });
      field = relativeField(result);
    }

    // Calculate the difference in terms of the requested or auto-selected field.
    options = { ...options, fields: [field] };
    result = difference(this, other, options);
    return [field, result[field] || 0];
  }

  /**
   * Calculate the period of time (years, months, days, ..) since the given date.
   *
   * In a normal call, "other is less-than-or-equal-to this".
   * If "this is less-than other" we invert the sign of the result.
   *
   * For example:
   *
   *   "2024-03-03".since("2024-01-30") == "1 month 4 days"
   *   "2024-01-30".since("2024-03-03") == "-1 month -3 days"
   *
   * The durations are not symmetrical due to calendar math, e.g. end-of-month alignment
   * with months of different lengths.
   *
   * @public
   */
  since(other: CalendarDate, options?: DateDiffOptions): TimePeriod {
    return this._negatePeriod(difference(this, other, options || {}));
  }

  /**
   * Calculate the period of time (years, months, days, ..) until the given date.
   *
   * In a normal call, "this is less-than-or-equal-to other".
   * If "other is less-than this" we invert the sign of the result.
   *
   * For example:
   *
   *   "2024-01-30".until("2024-03-30") == "1 month 3 days"
   *   "2024-03-03".until("2024-01-30") == "-1 month -4 days"
   *
   * The duration are not symmetrical due to calendar math, e.g. end-of-month alignment
   * with months of different lengths.
   *
   * @public
   */
  until(other: CalendarDate, options?: DateDiffOptions): TimePeriod {
    return difference(this, other, options || {});
  }

  /**
   * Calculate the time period between two dates. Note this returns the
   * absolute value of the difference.
   *
   * @public
   */
  difference(other: CalendarDate, options?: DateDiffOptions): TimePeriod {
    const result = difference(this, other, options || {});
    return this.compare(other) === 1 ? (this._negatePeriod(result) as TimePeriod) : result;
  }

  /**
   * Calculate the time period between two dates. If 'other' is before this date,
   * the time period fields will be negative.
   *
   * @public
   */
  differenceSigned(other: CalendarDate, options?: DateDiffOptions): TimePeriod {
    return this.until(other, options);
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
   * Return a string containing the date.
   */
  toDateString(): string {
    const y = this.extendedYear();
    const neg = y < 0;
    return (
      `${neg ? '-' : ''}${zeropad(Math.abs(y), 4)}` + `-${zeropad(this.month(), 2)}-${zeropad(this.dayOfMonth(), 2)}`
    );
  }

  /**
   * Return a string containing the time, with optional timezone.
   */
  toTimeString(options?: TimeStringOptions): string {
    let s = `${zeropad(this.hourOfDay(), 2)}:${zeropad(this.minute(), 2)}:${zeropad(this.second(), 2)}`;
    const ms = this.milliseconds();

    // Check if user disabled display of milliseconds when zero
    const showMilliseconds = !(options && options.optionalMilliseconds && ms === 0);
    if (showMilliseconds) {
      s += `.${zeropad(ms, 3)}`;
    }
    if (options) {
      if (options.includeZoneOffset) {
        s += `${formatZoneOffset(this)}`;
      }
      if (options.includeZoneId) {
        s += ` ${this._zoneInfo.zoneid}`;
      }
    }
    return s;
  }

  /**
   * Return a compact string containing just date and time, with optional timezone.
   */
  toDateTimeString(options?: TimeStringOptions): string {
    return `${this.toDateString()} ${this.toTimeString(options)}`;
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

  // TODO: reorganize calendar-specific methods
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
      (clamp(f.hour || 0, 0, 23) | 0) * CalendarConstants.ONE_HOUR_MS +
      (clamp(f.minute || 0, 0, 59) | 0) * CalendarConstants.ONE_MINUTE_MS +
      (clamp(f.second || 0, 0, 59) | 0) * CalendarConstants.ONE_SECOND_MS +
      (clamp(f.millis || 0, 0, 999) | 0)
    );
  }

  protected _negatePeriod(fields: Partial<TimePeriod>): TimePeriod {
    const r: Partial<TimePeriod> = {};
    for (const f of TIME_PERIOD_FIELDS) {
      const v = fields[f];
      r[f] = v ? -v : 0;
    }
    return r as TimePeriod;
    // const result: Partial<TimePeriod> = {};
    // (Object.keys(TIME_PERIOD_FIELDS) as (keyof TimePeriod)[]).forEach((k) => (result[k] = -(fields[k] || 0)));
    // return result as TimePeriod;
  }

  protected initFromUnixEpoch(ms: number, zoneId: string): void {
    this._zoneInfo = initBaseFromUnixEpoch(this._fields, ms, zoneId);
  }

  protected initFromJD(jd: number, msDay: number, zoneId: string): void {
    const unixEpoch = unixEpochFromJD(jd, msDay);
    this.initFromUnixEpoch(unixEpoch, zoneId);
  }

  protected _toString(type: string): string {
    return `${type} ${this.toDateString()} ${this.toTimeString({ includeZoneId: true })}`;
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

  // protected utcfields(): number[] {
  //   const u = this.unixEpoch();
  //   const f = this._fields.slice(0);
  //   fieldsFromUnixEpoch(u, f);
  //   computeBaseFields(f);
  //   this.initFields(f);
  //   return f;
  // }
}

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

const formatZoneOffset = (date: CalendarDate): string => {
  const [_, negative, hours, minutes] = getTZC(date.timeZoneOffset());
  let s = '';
  const zero = hours === 0 && minutes === 0;
  s += zero ? '+' : negative ? '-' : '+';
  s += zeropad(hours, 2);
  s += ':';
  s += zeropad(minutes, 2);
  return s;
};

/**
 * Compare two dates a and b, returning:
 *
 * ```
 *   a < b  ->  -1
 *   a = b  ->  0
 *   a > b  ->  1
 * ```
 */
export const compare = (a: CalendarDate, b: CalendarDate): number => {
  const _a = a.unixEpoch();
  const _b = b.unixEpoch();
  return _a < _b ? -1 : _a > _b ? 1 : 0;
};

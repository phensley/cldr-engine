import { DateTimePatternField, DateTimePatternFieldType, MetaZoneType } from '@phensley/cldr-schema';
import { dateFields, DateField, DayOfWeek } from './fields';
import { CalendarConstants, ConstantsDesc } from './constants';
import { substituteZoneAlias, zoneInfoFromUTC, ZoneInfo } from './timezone';
import { INTERNAL_NUMBERING } from '../numbering';

const zeropad = (n: number, w: number) => INTERNAL_NUMBERING.formatString(n, false, w);

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

const floor = Math.floor;

// The internal type name for Gregorian calendar is "gregory" so that it can fit
// into a language tag ("zh-u-ca-gregory") as "gregorian" exceeds the 8-char
// limit.
// See https://www.unicode.org/reports/tr35/#Key_And_Type_Definitions_
export type CalendarType = 'buddhist' | 'gregory' | 'iso8601' | 'japanese' | 'persian';

export type CalendarFromUnixEpoch<T> = (epoch: number, zoneId: string, firstDay: number, minDays: number) => T;

/**
 * Generic structure used to add one or more fields to a date.
 *
 * @alpha
 */
export interface CalendarDateFields {
  year?: number;
  month?: number;
  week?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millis?: number;
  zoneId?: string;
}

const differenceFields: [number, DateTimePatternFieldType][] = [
  [DateField.YEAR, DateTimePatternField.YEAR],
  [DateField.MONTH, DateTimePatternField.MONTH],
  [DateField.DAY_OF_MONTH, DateTimePatternField.DAY],
  [DateField.AM_PM, DateTimePatternField.DAYPERIOD],
  [DateField.HOUR, DateTimePatternField.HOUR],
  [DateField.MINUTE, DateTimePatternField.MINUTE],
];

/**
 * Base class for dates in supported calendars.
 *
 * @alpha
 */
export abstract class CalendarDate {

  protected _fields: number[] = dateFields();
  protected _zoneInfo!: ZoneInfo;

  /**
   * Minimal fields required to construct any calendar date.
   */
  protected constructor(
    protected readonly _type: CalendarType,
    protected readonly _firstDay: number,
    protected readonly _minDays: number) {

    // Compute week fields on demand.
    this._fields[DateField.WEEK_OF_YEAR] = NULL;
    this._fields[DateField.YEAR_WOY] = NULL;
  }

  /**
   * Calendar type for this date, e.g. 'gregory' for Gregorian.
   */
  type(): CalendarType {
    return this._type;
  }

  /**
   * Unix epoch with no timezone offset.
   */
  unixEpoch(): number {
    return this._fields[DateField.LOCAL_MILLIS] - this._zoneInfo.offset;
  }

  firstDayOfWeek(): number {
    return this._firstDay;
  }

  minDaysInFirstWeek(): number {
    return this._minDays;
  }

  /**
   * Returns a floating point number representing the real Julian Day, UTC.
   */
  julianDay(): number {
    const ms = (this._fields[DateField.MILLIS_IN_DAY] - this._zoneInfo.offset) / CalendarConstants.ONE_DAY_MS;
    return (this._fields[DateField.JULIAN_DAY] - 0.5) + ms;
  }

  /**
   * CLDR's modified Julian day used as the basis for all date calculations.
   */
  modifiedJulianDay(): number {
    return this._fields[DateField.JULIAN_DAY];
  }

  era(): number {
    return this._fields[DateField.ERA];
  }

  extendedYear(): number {
    return this._fields[DateField.EXTENDED_YEAR];
  }

  year(): number {
    return this._fields[DateField.YEAR];
  }

  relatedYear(): number {
    return this._fields[DateField.EXTENDED_YEAR];
  }

  yearOfWeekOfYear(): number {
    this.computeWeekFields();
    return this._fields[DateField.YEAR_WOY];
  }

  weekOfYear(): number {
    this.computeWeekFields();
    return this._fields[DateField.WEEK_OF_YEAR];
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
    return (7 - firstDay + weekday) % 7 + 1;
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

  dayOfMonth(): number {
    return this._fields[DateField.DAY_OF_MONTH];
  }

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

  milliseconds(): number {
    return this._fields[DateField.MILLIS];
  }

  millisecondsInDay(): number {
    return this._fields[DateField.MILLIS_IN_DAY];
  }

  metaZoneId(): MetaZoneType {
    return this._zoneInfo.metazoneid as MetaZoneType;
  }

  timeZoneId(): string {
    return this._zoneInfo.zoneid;
  }

  timeZoneStableId(): string {
    return this._zoneInfo.stableid;
  }

  timeZoneOffset(): number {
    return this._zoneInfo.offset;
  }

  isLeapYear(): boolean {
    return this._fields[DateField.IS_LEAP] === 1;
  }

  isDaylightSavings(): boolean {
    return this._zoneInfo.dst === 1;
  }

  /**
   * Computes the field of greatest difference between the two dates.
   * Note: This assumes the dates are of the same type and have the same
   * timezone offset.
   */
  fieldOfGreatestDifference(other: CalendarDate): DateTimePatternFieldType {
    const a = this._fields;
    const b = other._fields;
    for (const pair of differenceFields) {
      const [key, field] = pair;
      if (a[key] !== b[key]) {
        return field;
      }
    }
    return DateTimePatternField.SECOND;
  }

  abstract add(fields: CalendarDateFields): CalendarDate;
  protected abstract monthCount(): number;

  /**
   * Compute a new Julian day and milliseconds UTC by updating one or more fields.
   */
  protected _add(fields: CalendarDateFields): [number, number] {
    // All day calculations will be relative to the current day of the month.
    const dom = this._fields[DateField.DAY_OF_MONTH] + (fields.day || 0) + ((fields.week || 0) * 7);

    // Adjust the extended year and month. Note: month may be fractional here,
    // but will be <= 12 after modulus the year
    const mc = this.monthCount();
    const months = floor((fields.year || 0) * mc);
    let month = (this._fields[DateField.MONTH] - 1) + (fields.month || 0) + months;

    const yadd = floor(month / mc);
    const year = this._fields[DateField.EXTENDED_YEAR] + yadd;
    month -= yadd * mc;

    // Calculate days and milliseconds from the time-oriented fields.
    const [days, ms] = this._addTime(fields);

    // Calculate the Julian day for the adjusted year/month then add back the days.
    const jd = this.monthStart(year, month, false) + dom + days;
    const ijd = floor(jd);

    // Calculate ms and handle rollover
    let _ms = ms + ((jd - ijd) * CalendarConstants.ONE_DAY_MS);
    _ms = Math.round(_ms) | 0;

    // NOTE: _ms is always less than one day here
    // if (_ms >= CalendarConstants.ONE_DAY_MS) {
    //   ijd++;
    //   _ms -= CalendarConstants.ONE_DAY_MS;
    // }

    return [ijd, _ms];
  }

  /**
   * Converts all time fields into [days, milliseconds].
   */
  protected _addTime(fields: CalendarDateFields): [number, number] {
    // Calculate the time difference in days and milliseconds
    let msDay = this._fields[DateField.MILLIS_IN_DAY] - this.timeZoneOffset();
    msDay += ((fields.hour || 0) * CalendarConstants.ONE_HOUR_MS) +
             ((fields.minute || 0) * CalendarConstants.ONE_MINUTE_MS) +
             ((fields.second || 0) * CalendarConstants.ONE_SECOND_MS) +
             ((fields.millis || 0));

    const oneDay = CalendarConstants.ONE_DAY_MS;
    const days = floor(msDay / oneDay);
    const ms = (msDay - (days * oneDay));
    return [days, ms];
  }

  protected initFromUnixEpoch(ms: number, zoneId: string = 'UTC'): void {
    zoneId = substituteZoneAlias(zoneId);
    this._zoneInfo = zoneInfoFromUTC(zoneId, ms);
    jdFromUnixEpoch(ms + this._zoneInfo.offset, this._fields);
    computeBaseFields(this._fields);
  }

  protected initFromJD(jd: number, msDay: number, zoneId: string = 'UTC'): void {
    const unixEpoch = unixEpochFromJD(jd, msDay);
    this.initFromUnixEpoch(unixEpoch, zoneId);
  }

  protected _toString(type: string, year?: string): string {
    return `${type} ${year || this.year()}-${zeropad(this.month(), 2)}-${zeropad(this.dayOfMonth(), 2)} ` +
      `${zeropad(this.hourOfDay(), 2)}:${zeropad(this.minute(), 2)}:${zeropad(this.second(), 2)}` +
      `.${zeropad(this.milliseconds(), 3)} ${this._zoneInfo.zoneid}`;
  }

  /**
   * Compute WEEK_OF_YEAR and YEAR_WOY on demand.
   */
  protected computeWeekFields(): void {
    const f = this._fields;
    if (f[DateField.YEAR_WOY] !== NULL) {
      return;
    }

    const eyear = f[DateField.EXTENDED_YEAR];
    const dow = f[DateField.DAY_OF_WEEK];
    const dom = f[DateField.DAY_OF_MONTH];
    const doy = f[DateField.DAY_OF_YEAR];

    let ywoy = eyear;
    const rdow = (dow + 7 - this._firstDay) % 7;
    const rdowJan1 = (dow - doy + 7001 - this._firstDay) % 7;
    let woy = floor((doy - 1 + rdowJan1) / 7);
    if ((7 - rdowJan1) >= this._minDays) {
      woy++;
    }

    if (woy === 0) {
      const prevDay = doy + this.yearLength(eyear - 1);
      woy = this.weekNumber(prevDay, prevDay, dow);
      ywoy--;
    } else {
      const lastDoy = this.yearLength(eyear);
      if (doy >= (lastDoy - 5)) {
        let lastRdow = (rdow + lastDoy - doy) % 7;
        if (lastRdow < 0) {
          lastRdow += 7;
        }
        if (((6 - lastRdow) >= this._minDays) && ((doy + 7 - rdow) > lastDoy)) {
          woy = 1;
          ywoy++;
        }
      }
    }
    f[DateField.WEEK_OF_MONTH] = this.weekNumber(dom, dom, dow);
    f[DateField.WEEK_OF_YEAR] = woy;
    f[DateField.YEAR_WOY] = ywoy;
    f[DateField.DAY_OF_WEEK_IN_MONTH] = ((dom - 1) / 7 | 0) + 1;
  }

  protected yearLength(y: number): number {
    return this.monthStart(y + 1, 0, false) - this.monthStart(y, 0, false);
  }

  protected weekNumber(desiredDay: number, dayOfPeriod: number, dayOfWeek: number): number {
    let psow = (dayOfWeek - this._firstDay - dayOfPeriod + 1) % 7;
    if (psow < 0) {
      psow += 7;
    }
    const weekNo = floor((desiredDay + psow - 1) / 7);
    return ((7 - psow) >= this._minDays) ? weekNo + 1 : weekNo;
  }

  protected abstract monthStart(eyear: number, month: number, useMonth: boolean): number;
}

/**
 * Compute Julian day from timezone-adjusted Unix epoch milliseconds.
 */
const jdFromUnixEpoch = (ms: number, f: number[]): void => {
  const oneDayMS = CalendarConstants.ONE_DAY_MS;
  const days = floor(ms / oneDayMS);
  const jd = days + CalendarConstants.JD_UNIX_EPOCH;
  const msDay = ms - (days * oneDayMS);

  f[DateField.JULIAN_DAY] = jd;
  f[DateField.MILLIS_IN_DAY] = msDay;
};

/**
 * Given a Julian day and local milliseconds (in UTC), return the Unix
 * epoch milliseconds UTC.
 */
const unixEpochFromJD = (jd: number, msDay: number): number => {
  const days = jd - CalendarConstants.JD_UNIX_EPOCH;
  return (days * CalendarConstants.ONE_DAY_MS) + msDay;
};

/**
 * Compute fields common to all calendars. Before calling this, we must
 * have the JULIAN_DAY and MILLIS_IN_DAY fields set. Every calculation
 * is relative to these.
 */
const computeBaseFields = (f: number[]): void => {
  const jd = f[DateField.JULIAN_DAY];
  checkJDRange(jd);

  let msDay = f[DateField.MILLIS_IN_DAY];
  const ms = msDay + ((jd - CalendarConstants.JD_UNIX_EPOCH) * CalendarConstants.ONE_DAY_MS);

  f[DateField.LOCAL_MILLIS] = ms;
  f[DateField.JULIAN_DAY] = jd;
  f[DateField.MILLIS_IN_DAY] = msDay;
  f[DateField.MILLIS] = msDay % 1000;

  msDay = msDay / 1000 | 0;
  f[DateField.SECOND] = msDay % 60;

  msDay = msDay / 60 | 0;
  f[DateField.MINUTE] = msDay % 60;

  msDay = msDay / 60 | 0;
  f[DateField.HOUR_OF_DAY] = msDay;
  f[DateField.AM_PM] = msDay / 12 | 0;
  f[DateField.HOUR] = msDay % 12;

  let dow = (jd + DayOfWeek.MONDAY) % 7;
  if (dow < DayOfWeek.SUNDAY) {
    dow += 7;
  }
  f[DateField.DAY_OF_WEEK] = dow;
};

const checkJDRange = (jd: number): void => {
  if (jd < CalendarConstants.JD_MIN || jd > CalendarConstants.JD_MAX) {
    throw new Error(
      `Julian day ${jd} is outside the supported range of this library: ` +
      `${ConstantsDesc.JD_MIN} to ${ConstantsDesc.JD_MAX}`);
  }
};

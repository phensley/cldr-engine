import { DateTimePatternField, DateTimePatternFieldType, MetaZoneType } from '@phensley/cldr-schema';
import { DateField, dateFields, DayOfWeek } from './fields';
import { CalendarConstants, ConstantsDesc } from './constants';
import { ZoneInfo, zoneInfoCache, substituteZoneAlias } from './timezone';
import { CLIENT_RENEG_LIMIT } from 'tls';

/**
 * Implementation order, based on calendar preference data and ease of implementation.
 * https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/calendarPreferenceData.json
 *
 * Complete:
 *  gregorian           - widely used worldwide
 *  persian             - primary in AF, IR
 *  japanese            - secondary in JP, based on gregorian
 *  iso8601             - based on gregorian
 *
 * Next:
 *  buddhist            - primary in TH
 *  islamic-umalqura    - primary in SA
 *  chinese             - secondary in CN, CX, HK, MO, SG, TW
 *  islamic             - secondary in many locales
 *  dangi               - secondary in KO
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
export type CalendarType = 'gregory' | 'iso8601' | 'japanese' | 'persian';

export type CalendarFromUnixEpoch<T> = (epoch: number, zoneId: string, firstDay: number, minDays: number) => T;

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
 */
export abstract class CalendarDate {

  protected _fields: number[] = dateFields();
  protected _zoneInfo: ZoneInfo;

  /**
   * Minimal fields required to construct any calendar date.
   */
  constructor(
    protected readonly _type: CalendarType,
    protected readonly _unixEpoch: number,
    _zoneId: string,
    protected readonly _firstDay: number,
    protected readonly _minDays: number) {

    _zoneId = substituteZoneAlias(_zoneId);
    this._zoneInfo = zoneInfoCache.get(_unixEpoch, _zoneId);
    computeBaseFields(_unixEpoch - this._zoneInfo.offset, this._fields);

    // Compute week fields on demand.
    this._fields[DateField.WEEK_OF_YEAR] = NULL;
    this._fields[DateField.YEAR_WOY] = NULL;
  }

  type(): CalendarType {
    return this._type;
  }

  unixEpoch(): number {
    return this._unixEpoch;
  }

  firstDayOfWeek(): number {
    return this._firstDay;
  }

  minDaysInFirstWeek(): number {
    return this._minDays;
  }

  julianDay(): number {
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

  yearOfWeekOfYear(): number {
    this.computeWeekFields();
    return this._fields[DateField.YEAR_WOY];
  }

  weekOfYear(): number {
    this.computeWeekFields();
    return this._fields[DateField.WEEK_OF_YEAR];
  }

  month(): number {
    return this._fields[DateField.MONTH];
  }

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

  hour(): number {
    return this._fields[DateField.HOUR];
  }

  hourOfDay(): number {
    return this._fields[DateField.HOUR_OF_DAY];
  }

  minute(): number {
    return this._fields[DateField.MINUTE];
  }

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
    return this._zoneInfo.metaZoneId;
  }

  timeZoneId(): string {
    return this._zoneInfo.timeZoneId;
  }

  timeZoneOffset(): number {
    return this._zoneInfo.offset;
  }

  isLeapYear(): boolean {
    return this._fields[DateField.IS_LEAP] === 1;
  }

  isDaylightSavings(): boolean {
    return this._zoneInfo.dst;
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

  protected _toString(type: string): string {
    return `${type}Date(epoch=${this._unixEpoch}, zone=${this._zoneInfo.timeZoneId})`;
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
 * Compute fields common to all calendars.
 */
const computeBaseFields = (ms: number, f: number[]): void => {
  const days = floor(ms / CalendarConstants.ONE_DAY_MS);
  const jd = days + CalendarConstants.JD_UNIX_EPOCH;
  if (jd < CalendarConstants.JD_MIN || jd > CalendarConstants.JD_MAX) {
    throw new Error(
      `Julian day ${jd} is outside the supported range of this library: ` +
      `${ConstantsDesc.JD_MIN} to ${ConstantsDesc.JD_MAX}`);
  }

  let msDay = ms - (days * CalendarConstants.ONE_DAY_MS);

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

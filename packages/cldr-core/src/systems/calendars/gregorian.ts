import { TZ } from '@phensley/timezone';
import { CalendarConstants } from './constants';
import { CalendarDate } from './calendar';
import { CalendarDateFields, CalendarType } from './types';
import { DateField } from './fields';
import { floorDiv } from './utils';
import { TimePeriod } from './interval';

const ZEROS: Partial<CalendarDateFields> = {
  year: 1970,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millis: 0,
};

/**
 * Construct a date using the rules of the Gregorian calendar.
 *
 * type: gregory
 *
 * @public
 */
export class GregorianDate extends CalendarDate {
  static _init: void = ((): void => {
    CalendarDate._gregorian = (d, utc, fd, md): GregorianDate =>
      GregorianDate.fromUnixEpoch(d.unixEpoch(), utc ? 'Etc/UTC' : d.timeZoneId(), fd, md);
  })();

  protected constructor(type: CalendarType, firstDay: number, minDays: number) {
    super(type, firstDay, minDays);
  }

  set(fields: Partial<CalendarDateFields>): GregorianDate {
    return this._set({ ...this.fields(), ...fields });
  }

  add(fields: Partial<TimePeriod>): GregorianDate {
    const [jd, ms] = this._add(fields);
    return this._new().initFromJD(jd, ms, this.timeZoneId());
  }

  subtract(fields: Partial<TimePeriod>): GregorianDate {
    return this.add(this._invertPeriod(fields));
  }

  withZone(zoneId: string): GregorianDate {
    return this._new().initFromUnixEpoch(this.unixEpoch(), zoneId);
  }

  toString(): string {
    return this._toString('Gregorian');
  }

  static fromFields(fields: Partial<CalendarDateFields>, firstDay: number = 1, minDays: number = 1): GregorianDate {
    return new GregorianDate('gregory', firstDay, minDays)._set({ ...ZEROS, ...fields });
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number = 1, minDays: number = 1): GregorianDate {
    return new GregorianDate('gregory', firstDay, minDays).initFromUnixEpoch(epoch, zoneId);
  }

  protected _new(): GregorianDate {
    return new GregorianDate('gregory', this._firstDay, this._minDays);
  }

  protected initFromUnixEpoch(epoch: number, zoneId: string): GregorianDate {
    super.initFromUnixEpoch(epoch, zoneId);
    this.initFields(this._fields);
    return this;
  }

  protected initFromJD(jd: number, msDay: number, zoneId: string): GregorianDate {
    super.initFromJD(jd, msDay, zoneId);
    this.initFields(this._fields);
    return this;
  }

  protected initFields(f: number[]): void {
    if (f[DateField.JULIAN_DAY] >= CalendarConstants.JD_GREGORIAN_CUTOVER) {
      computeGregorianFields(f);
    } else {
      // We use Julian calendar for dates before the Gregorian cutover
      computeJulianFields(f);
    }

    // Set era and year based on extended year
    let year = f[DateField.EXTENDED_YEAR];
    let era = 1; // AD
    if (year < 1) {
      era = 0;
      year = 1 - year;
    }
    f[DateField.ERA] = era;
    f[DateField.YEAR] = year;
  }

  protected daysInMonth(y: number, m: number): number {
    return MONTH_COUNT[m][leapGregorian(y) ? 1 : 0];
  }

  protected daysInYear(y: number): number {
    return leapGregorian(y) ? 366 : 365;
  }

  protected monthCount(): number {
    return 12;
  }

  protected monthStart(eyear: number, month: number, _useMonth: boolean): number {
    let isLeap = (eyear | 0) % 4 === 0;
    const y = eyear - 1;
    let jd = 365 * y + floor(y / 4) + (CalendarConstants.JD_GREGORIAN_EPOCH - 3);
    if (eyear >= CalendarConstants.JD_GREGORIAN_CUTOVER_YEAR) {
      isLeap = isLeap && (eyear % 100 !== 0 || eyear % 400 === 0);
      jd += floor(y / 400) - floor(y / 100) + 2;
    }
    if (month !== 0) {
      const mc = MONTH_COUNT;
      const m = floor(month);
      const d = month - m;
      jd += mc[m][isLeap ? 3 : 2];

      // TODO: we never reach the block below since all internal uses of monthStart
      // pass in an integer

      // Check if there is a fractional month part, and if so add the number
      // of the days in the next month multiplied by the fraction
      /* istanbul ignore if */
      if (d !== 0) {
        // note: the 'month' parameter must always be <= # months in the calendar
        // year, so <= 12 in this case.
        jd += d * mc[m + 1][isLeap ? 1 : 0];
      }
    }
    return jd;
  }

  /**
   * Convert integer (year, month, day) to Julian day.
   */
  protected _ymdToJD(y: number, m: number, d: number): number {
    y |= 0;
    const leap = leapGregorian(y);
    const mc = this.monthCount();
    m = m < 1 ? 1 : m > mc ? mc : m;
    const dc = MONTH_COUNT[m - 1][leap ? 1 : 0];
    d = d < 1 ? 1 : d > dc ? dc : d;

    // Adjustment due to Gregorian calendar switch on Oct 4, 1582 -> Oct 15, 1582
    if (
      y < CalendarConstants.JD_GREGORIAN_CUTOVER_YEAR ||
      (y === CalendarConstants.JD_GREGORIAN_CUTOVER_YEAR &&
        (m < CalendarConstants.JD_GREGORIAN_CUTOVER_MONTH ||
          (m === CalendarConstants.JD_GREGORIAN_CUTOVER_MONTH && d < CalendarConstants.JD_GREGORIAN_CUTOVER_DAY)))
    ) {
      if (m < 3) {
        m += 12;
        y -= 1;
      }
      return 1721117 + floor((1461 * y) / 4) + floor((153 * m - 457) / 5) + d;
    }

    const a = ((14 - m) / 12) | 0;
    y = y + 4800 - a;
    m = m + 12 * a - 3;
    return d + (((153 * m + 2) / 5) | 0) + 365 * y + ((y / 4) | 0) - ((y / 100) | 0) + ((y / 400) | 0) - 32045;
  }

  protected _set(f: Partial<CalendarDateFields>): GregorianDate {
    const jd = this._ymdToJD(f.year!, f.month!, f.day!);
    const ms = this._timeToMs(f);
    const epoch = unixEpochFromJD(jd, ms);
    const zoneId = f.zoneId || this.timeZoneId();
    // Find UTC epoch for wall clock time in the requested timezone
    const r = TZ.fromWall(zoneId, epoch);
    return this._new().initFromUnixEpoch(r ? r[0] : epoch, zoneId);
  }
}

const floor = Math.floor;

const MONTH_COUNT = [
  [31, 31, 0, 0], // Jan
  [28, 29, 31, 31], // Feb
  [31, 31, 59, 60], // Mar
  [30, 30, 90, 91], // Apr
  [31, 31, 120, 121], // May
  [30, 30, 151, 152], // Jun
  [31, 31, 181, 182], // Jul
  [31, 31, 212, 213], // Aug
  [30, 30, 243, 244], // Sep
  [31, 31, 273, 274], // Oct
  [30, 30, 304, 305], // Nov
  [31, 31, 334, 335], // Dec
];

/**
 * Compute fields for dates on or after the Gregorian cutover.
 */
const computeGregorianFields = (f: number[]): void => {
  const ged = f[DateField.JULIAN_DAY] - CalendarConstants.JD_GREGORIAN_EPOCH;
  const rem: [number] = [0];
  const n400 = floorDiv(ged, 146097, rem);
  const n100 = floorDiv(rem[0], 36524, rem);
  const n4 = floorDiv(rem[0], 1461, rem);
  const n1 = floorDiv(rem[0], 365, rem);

  let year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
  let doy = rem[0]; // 0-based day of year
  if (n100 === 4 || n1 === 4) {
    doy = 365;
  } else {
    ++year;
  }
  const isLeap = leapGregorian(year);
  let corr = 0;
  const mar1 = isLeap ? 60 : 59;
  if (doy >= mar1) {
    corr = isLeap ? 1 : 2;
  }
  const month = floor((12 * (doy + corr) + 6) / 367);
  const dom = doy - MONTH_COUNT[month][isLeap ? 3 : 2] + 1;

  f[DateField.EXTENDED_YEAR] = year;
  f[DateField.MONTH] = month + 1;
  f[DateField.DAY_OF_MONTH] = dom;
  f[DateField.DAY_OF_YEAR] = doy + 1;
  f[DateField.IS_LEAP] = isLeap ? 1 : 0;
};

/**
 * Compute fields for dates before the Gregorian cutover using the proleptic
 * Julian calendar. Any Gregorian date before October 15, 1582 is really a
 * date on the proleptic Julian calendar, with leap years every 4 years.
 */
const computeJulianFields = (f: number[]): void => {
  const jed = f[DateField.JULIAN_DAY] - (CalendarConstants.JD_GREGORIAN_EPOCH - 2);
  const eyear = floor((4 * jed + 1464) / 1461);
  const jan1 = 365 * (eyear - 1) + floor((eyear - 1) / 4);
  const doy = jed - jan1;
  const isLeap = eyear % 4 === 0;
  let corr = 0;
  const mar1 = isLeap ? 60 : 59;
  if (doy >= mar1) {
    corr = isLeap ? 1 : 2;
  }

  const month = floor((12 * (doy + corr) + 6) / 367);
  const dom = doy - MONTH_COUNT[month][isLeap ? 3 : 2] + 1;

  f[DateField.EXTENDED_YEAR] = eyear;
  f[DateField.MONTH] = month + 1;
  f[DateField.DAY_OF_MONTH] = dom;
  f[DateField.DAY_OF_YEAR] = doy + 1;
  f[DateField.IS_LEAP] = isLeap ? 1 : 0;
};

/**
 * Return true if the given year is a leap year in the Gregorian calendar; false otherwise.
 * Note that we switch to the Julian calendar at the Gregorian cutover year.
 */
const leapGregorian = (y: number): boolean => {
  let r = y % 4 === 0;
  if (y >= CalendarConstants.JD_GREGORIAN_CUTOVER_YEAR) {
    r = r && (y % 100 !== 0 || y % 400 === 0);
  }
  return r;
};

/**
 * Given a Julian day and local milliseconds (in UTC), return the Unix
 * epoch milliseconds UTC.
 */
const unixEpochFromJD = (jd: number, msDay: number): number => {
  const days = jd - CalendarConstants.JD_UNIX_EPOCH;
  return days * CalendarConstants.ONE_DAY_MS + Math.round(msDay);
};

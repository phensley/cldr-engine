import { CalendarConstants } from './constants';
import { CalendarType, CalendarDate } from './calendar';
import { DateField } from './fields';
import { floorDiv } from './utils';

/**
 * Construct a date using the rules of the Gregorian calendar.
 *
 * type: gregory
 */
export class GregorianDate extends CalendarDate {

  protected constructor(type: CalendarType, epoch: number, zoneId: string, firstDay: number, minDays: number) {
    super(type, epoch, zoneId, firstDay, minDays);

    const f = this._fields;
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

  toString(): string {
    return this._toString('Gregorian');
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number = 1, minDays: number = 1): GregorianDate {
    return new GregorianDate('gregory', epoch, zoneId, firstDay, minDays);
  }

  protected monthStart(eyear: number, month: number, useMonth: boolean): number {
    let isLeap = eyear % 4 === 0;
    const y = eyear - 1;
    let jd = 365 * y + floor(y / 4) + (CalendarConstants.JD_GREGORIAN_EPOCH - 3);
    if (eyear >= CalendarConstants.JD_GREGORIAN_CUTOVER_YEAR) {
      isLeap = isLeap && ((eyear % 100 !== 0) || (eyear % 400 === 0));
      jd += floor(y / 400) - floor(y / 100) + 2;
    }
    if (month !== 0) {
      jd += MONTH_COUNT[month][isLeap ? 3 : 2];
    }
    return jd;
  }
}

const floor = Math.floor;

const MONTH_COUNT = [
  [  31,  31,   0,   0 ], // Jan
  [  28,  29,  31,  31 ], // Feb
  [  31,  31,  59,  60 ], // Mar
  [  30,  30,  90,  91 ], // Apr
  [  31,  31, 120, 121 ], // May
  [  30,  30, 151, 152 ], // Jun
  [  31,  31, 181, 182 ], // Jul
  [  31,  31, 212, 213 ], // Aug
  [  30,  30, 243, 244 ], // Sep
  [  31,  31, 273, 274 ], // Oct
  [  30,  30, 304, 305 ], // Nov
  [  31,  31, 334, 335 ]  // Dec
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
  f[DateField.MONTH] = month;
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
  f[DateField.MONTH] = month;
  f[DateField.DAY_OF_MONTH] = dom;
  f[DateField.DAY_OF_YEAR] = doy + 1;
  f[DateField.IS_LEAP] = isLeap ? 1 : 0;
};

/**
 * Return true if the given year is a leap year in the Gregorian calendar; false otherwise.
 */
const leapGregorian = (y: number): boolean => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
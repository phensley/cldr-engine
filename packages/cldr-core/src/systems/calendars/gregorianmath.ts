import { CalendarConstants } from './constants';
import { DateField } from './fields';
import { floorDiv } from './math';

const floor = Math.floor;

export const MONTH_COUNT = [
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

export const initGregorianFields = (f: number[]): void => {
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
};

/**
 * Compute fields for dates on or after the Gregorian cutover.
 */
export const computeGregorianFields = (f: number[]): void => {
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
export const computeJulianFields = (f: number[]): void => {
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
 * Returns the number of days in the given month for the given year. The month must be 0-based.
 */
export const daysInMonth = (y: number, m: number): number => MONTH_COUNT[m][leapGregorian(y) ? 1 : 0];

export const monthStart = (eyear: number, month: number, _useMonth: boolean): number => {
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
    /* istanbul ignore if -- @preserve */
    if (d !== 0) {
      // note: the 'month' parameter must always be <= # months in the calendar
      // year, so <= 12 in this case.
      jd += d * mc[m + 1][isLeap ? 1 : 0];
    }
  }
  return jd;
};

/**
 * Return true if the given year is a leap year in the Gregorian calendar; false otherwise.
 * Note that we switch to the Julian calendar at the Gregorian cutover year.
 */
export const leapGregorian = (y: number): boolean => {
  let r = y % 4 === 0;
  if (y >= CalendarConstants.JD_GREGORIAN_CUTOVER_YEAR) {
    r = r && (y % 100 !== 0 || y % 400 === 0);
  }
  return r;
};

/**
 * Convert integer (year, month, day) to Julian day.
 */
export const ymdToJD = (y: number, m: number, d: number, monthCount: number): number => {
  y |= 0;
  const leap = leapGregorian(y);
  m = m < 1 ? 1 : m > monthCount ? monthCount : m;
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
};

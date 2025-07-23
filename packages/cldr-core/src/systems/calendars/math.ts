import { CalendarDate } from './calendar';
import { CalendarConstants } from './constants';
import { DateField, DayOfWeek } from './fields';
import { daysInMonth } from './gregorianmath';
import { TIME_PERIOD_FIELDS, TimePeriod } from './interval';
import { substituteZoneAlias, ZoneInfo, zoneInfoFromUTC } from './timezone';

const { floor } = Math;

export interface YearMonthDay {
  year: number;
  month: number;
  day: number;
}

export interface YearMonth {
  year: number;
  month: number;
}

/**
 * Extract year, month, and day fields.
 */
export const toYMD = (d: CalendarDate): YearMonthDay => ({
  year: d.extendedYear(),
  month: d.month(),
  day: d.dayOfMonth(),
});

/**
 * Given a Julian day and local milliseconds (in UTC), return the Unix
 * epoch milliseconds UTC.
 */
export const unixEpochFromJD = (jd: number, msDay: number): number => {
  const days = jd - CalendarConstants.JD_UNIX_EPOCH;
  return days * CalendarConstants.ONE_DAY_MS + Math.round(msDay);
};

// TODO: reorganize calendar math
// export const jdToYMD = (jd: number, millis: number, zoneId: string): YearMonthDay => {
//   const f = dateFields();
//   const epoch = unixEpochFromJD(jd, millis);
//   initBaseFromUnixEpoch(f, epoch, zoneId);
//   initGregorianFields(f);
//   return {
//     year: f[DateField.EXTENDED_YEAR],
//     month: f[DateField.MONTH],
//     day: f[DateField.DAY_OF_MONTH],
//   };
// };

/**
 * Ensure n falls between min and max.
 */
export const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));

/**
 * Ensure that the year, month, and day represent a valid date, clamping the
 * month and day fields to a valid range.
 */
export const clampYMD = (year: number, monthArg: number, d: number): YearMonthDay => {
  const month = clamp(monthArg, 1, 12);
  const day = clamp(d, 1, daysInMonth(year, month - 1));
  return { year, month, day };
};

/**
 * Adjust the year and month to ensure they represent part of a valid date.
 */
export const adjustYM = (yearp: number, monthp: number): YearMonth => {
  let year = yearp;
  let month = monthp;
  month -= 1;
  year += Math.floor(month / 12);
  month %= 12;
  if (month < 0) {
    month += 12;
  }
  month += 1;
  return { year, month };
};

/**
 * Add time fields in milliseconds.
 */
export const adjustTime = (millis: number, added: TimePeriod): [number, number] => {
  let ms = millis + timeToMillis(added);

  // Extract days from the time fields and add them.
  const days = (ms / CalendarConstants.ONE_DAY_MS) | 0;
  ms -= days * CalendarConstants.ONE_DAY_MS;
  return [days, ms];
};

export const timeToMillis = (period: Partial<TimePeriod>): number => {
  return (
    (period.hour || 0) * CalendarConstants.ONE_HOUR_MS +
    (period.minute || 0) * CalendarConstants.ONE_MINUTE_MS +
    (period.second || 0) * CalendarConstants.ONE_SECOND_MS +
    (period.millis || 0)
  );
};

/**
 * Keep the integral part of each field and replace undefined with zero.
 */
export const truncateFields = (fields: Partial<TimePeriod>): TimePeriod => {
  let result: Partial<TimePeriod> = {};
  for (const key of TIME_PERIOD_FIELDS) {
    result[key] = Math.trunc(fields[key] || 0);
  }
  return result as TimePeriod;
};

/**
 * Compute Julian day from timezone-adjusted Unix epoch milliseconds.
 */
export const fieldsFromUnixEpoch = (ms: number, f: number[]): void => {
  const [jd, msDay] = jdFromUnixEpoch(ms);
  f[DateField.JULIAN_DAY] = jd;
  f[DateField.MILLIS_IN_DAY] = msDay;
};

/**
 * Compute the Julian day and the milliseconds remainder from a Unix epoch timestamp.
 */
export const jdFromUnixEpoch = (ms: number): [number, number] => {
  const days = floor(ms / CalendarConstants.ONE_DAY_MS);
  const jd = days + CalendarConstants.JD_UNIX_EPOCH;
  const msDay = floor(ms - days * CalendarConstants.ONE_DAY_MS);
  return [jd, msDay];
};

/**
 * Initialize base calendar fields.
 */
export const initBaseFromUnixEpoch = (f: number[], ms: number, zoneId: string): ZoneInfo => {
  zoneId = substituteZoneAlias(zoneId);
  const zoneInfo = zoneInfoFromUTC(zoneId, ms);
  fieldsFromUnixEpoch(ms + zoneInfo.offset, f);
  computeBaseFields(f);
  return zoneInfo;
};

/**
 * Compute fields common to all calendars. Before calling this, we must
 * have the JULIAN_DAY and MILLIS_IN_DAY fields set. Every calculation
 * is relative to these.
 */
export const computeBaseFields = (f: number[]): void => {
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

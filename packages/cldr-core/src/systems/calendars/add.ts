import { TZ } from '@phensley/timezone';
import { CalendarDate } from './calendar';
import { CalendarConstants } from './constants';
import { timePeriod, TimePeriod } from './interval';
import {
  adjustTime,
  adjustYM,
  clampYMD,
  jdFromUnixEpoch,
  timeToMillis,
  toYMD,
  truncateFields,
  unixEpochFromJD,
  YearMonthDay,
} from './math';
import { CalendarDateInternals } from './types';

/**
 * Add years, days, hours, etc, to dates. This function always returns
 * the result in UTC.
 *
 * Compatible with the Temporal API (except for rounding; we only truncate)
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/add
 */
export const add = (orig: CalendarDate, added: Partial<TimePeriod>): [number, number] => {
  // Check if only date or time fields are present.
  const hasTime = added.hour || added.minute || added.second || added.millis;
  const hasDate = added.year || added.month || added.week || added.day;

  // Procedure:
  // 1. Add YEARS and MONTHS to base date.
  // 2. Clamp the original day to ensure the new date is valid, e.g.
  //    "Jan 31, 2024" + 1 month gives "Feb 29, 2024" instead of "Feb 31, 2024"
  //    or "Mar 2, 2024".
  // 3. Add the WEEKS and DAYS to the new date.
  // 4. Combine the new date with the original time-of-day. This finishes adding
  //    all of the date fields.
  // 3. Calculate the UNIX epoch timestamp for the new date.
  // 4. Disambiguate the epoch wall time to select the correct timezone offset.
  // 5. Finally add the time to the new epoch.

  // Get Julian day and milliseconds in UTC
  let jd = orig.modifiedJulianDay();
  let millis = orig.millisecondsInDay();
  let offset = orig.timeZoneOffset();

  // If nothing is being added, return the original date.
  if (!hasDate && !hasTime) {
    return [jd, millis - offset];
  }

  // Add integers only
  const truncated = truncateFields(added);

  // If only time is being added, skip the year/month logic
  // and add directly to the timestamp.
  if (!hasDate) {
    let [timeDays, ms] = adjustTime(millis - offset, truncated);
    jd += timeDays;
    return [jd, ms];
  }

  // Work in UTC then translate back later
  const date = orig.set({ zoneId: 'UTC' });
  const internal = date as any as CalendarDateInternals;

  // Add years and months directly to the date fields.
  let { year, month, day } = toYMD(date);

  // Break milliseconds down into days, hours, minutes, etc.
  const time = millisToTimePeriod(millis);

  // Add date fields
  ({ year, month, day } = dateAdd({ year, month, day }, truncated));

  // Compute the Julian day of the year, month, and add days.
  jd = internal.monthStart(year, month - 1, false) + day + time.day;

  // Convert Julian day and milliseconds to Unix epoch to find timezone offset.
  let epoch = unixEpochFromJD(jd, millis);

  // Get the wall clock timezone offset.
  const wall = TZ.fromWall(orig.timeZoneId(), epoch);
  if (wall) {
    epoch = wall[0];
  }

  // Add the time components.
  epoch += timeToMillis(truncated);

  // Convert the UNIX epoch back to Julian day and milliseconds-in-day.
  return jdFromUnixEpoch(epoch);
};

/**
 * Add the date parts of a TimePeriod to a date.
 */
export const dateAdd = (
  date: YearMonthDay,
  added: Pick<TimePeriod, 'year' | 'month' | 'week' | 'day'>,
): YearMonthDay => {
  let { year, month, day } = date;
  year += added.year!;
  month += added.month!;

  // Add excess months to years
  ({ year, month } = adjustYM(year, month));

  // Ensure the day falls into a valid range for the new year and month.
  ({ year, month, day } = clampYMD(year, month, day));

  // Add days from all sources
  day += added.week * 7 + added.day;
  return { year, month, day };
};

export const millisToTimePeriod = (millis: number) => {
  let r: TimePeriod = timePeriod();

  r.millis = millis;
  r.hour = (r.millis / CalendarConstants.ONE_HOUR_MS) | 0;
  r.millis -= r.hour * CalendarConstants.ONE_HOUR_MS;
  r.minute = (r.millis / CalendarConstants.ONE_MINUTE_MS) | 0;
  r.millis -= r.minute * CalendarConstants.ONE_MINUTE_MS;
  r.second = (r.millis / CalendarConstants.ONE_SECOND_MS) | 0;
  r.millis -= r.second * CalendarConstants.ONE_SECOND_MS;

  return r;
};

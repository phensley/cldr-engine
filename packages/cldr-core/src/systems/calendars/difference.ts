import { TZ } from '@phensley/timezone';
import { dateAdd } from './add';
import { CalendarDate, DateDiffOptions } from './calendar';
import { CalendarConstants } from './constants';
import { daysInMonth, ymdToJD } from './gregorianmath';
import { timePeriod, TimePeriod, TimePeriodFieldFlag, timePeriodFieldFlags } from './interval';
import { adjustYM, clampYMD, toYMD, unixEpochFromJD, YearMonth, YearMonthDay } from './math';
import { CalendarDateInternals } from './types';

/**
 * This file implements Temporal-compatible date difference, underpinning
 * the CalendarDate until/since methods.
 *
 * I've filled a bug against the specification and polyfill library that
 * affects dates spanning the Fall DST boundary, where clocks are set
 * back causing some wall clock times to occur twice, e.g.
 *  2025-11-02 01:01:00-07:00 followed by 01:01:00-08:00 1 hour later.
 *
 * Both the polyfill and Firefox throw a RangeError which seems unexpected
 * as these are otherwise normal zoned timestamps:
 * https://github.com/js-temporal/temporal-polyfill/issues/347
 * https://github.com/tc39/proposal-temporal/issues/3141
 *
 * A related issue involves off-by-1-hour results for times surrounding
 * the same boundary.
 *
 * I've solved both of the above issues in this library by detecting whether
 * two CalendarDate occur on the same calendar day, and thus skipping the
 * date-differencing logic entirely opting for a pure time-of-day difference.
 */
const DEFAULT_FLAGS =
  TimePeriodFieldFlag.YEAR |
  TimePeriodFieldFlag.MONTH |
  // No WEEK by default
  TimePeriodFieldFlag.DAY |
  TimePeriodFieldFlag.HOUR |
  TimePeriodFieldFlag.MINUTE |
  TimePeriodFieldFlag.SECOND |
  TimePeriodFieldFlag.MILLIS;

/**
 * State maintained for the difference calculation.
 *
 * Public for testing.
 */
export class DifferenceState {
  // Date as YMD
  one: YearMonthDay;
  two: YearMonthDay;
  readonly epoch2: number;

  // Time of day in milliseconds
  ms1: number;
  ms2: number;

  // Timezone identifier
  zoneId: string;

  // sign equals:
  //  -1 if date1 < date2
  //   1 if date1 > date2
  //   0 if date1 = date2
  readonly sign: number;

  // Increment is the negation of the sign. This is the
  // number of years/months we add to date1 to guess at date2.
  //
  // incr equals:
  //   1 if date1 < date2
  //  -1 if date1 > date2
  readonly incr: number;

  // Flag indicating whether fractional fields are allowed. If the caller
  // requests that the result be expressed in ['year', 'month'] and
  // has enabled fractional fields, any additional days will be added to
  // the months.
  readonly fractions: boolean;

  // Flags determining which fields in the result should have their values set.
  readonly flags: number;

  // Smallest flag requested.
  readonly smallestFlag: number;

  // Number of months in a year
  readonly monthCount: number;

  constructor(
    readonly date1: CalendarDate,
    readonly date2: CalendarDate,
    readonly options: DateDiffOptions,
  ) {
    this.one = toYMD(date1);
    this.two = toYMD(date2);
    this.epoch2 = date2.unixEpoch();
    this.ms1 = date1.millisecondsInDay();
    this.ms2 = date2.millisecondsInDay();
    this.zoneId = date1.timeZoneId();
    this.sign = date1.compare(date2);
    this.incr = -this.sign;
    this.fractions = !!options.rollupFractional;
    [this.flags, this.smallestFlag] = timePeriodFieldFlags(options.fields);
    if (!this.flags) {
      this.flags = DEFAULT_FLAGS;
    }
    const internal = date1 as any as CalendarDateInternals;
    this.monthCount = internal.monthCount();
  }

  /**
   * Return true if the flag is set.
   */
  has(flag: TimePeriodFieldFlag): boolean {
    return (flag & this.flags) !== 0;
  }

  /**
   * Return true if a flag is the smallest field in the set.
   */
  smallest(flag: TimePeriodFieldFlag): boolean {
    return flag === this.smallestFlag;
  }
}

/**
 * Calculate the difference between two dates in years, months, days, etc.
 *
 * Specification of algorithm:
 * https://tc39.es/proposal-temporal/#sec-temporal-differencezoneddatetime
 *
 * Compatible with the Temporal API until and since methods:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/since
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/until
 */
export const difference = (date1: CalendarDate, date2: CalendarDate, options: DateDiffOptions): TimePeriod => {
  let result: TimePeriod = timePeriod();

  // Track state across date and time sections
  const state = new DifferenceState(date1, date2, options);

  // If equal, return zero.
  if (state.sign === 0) {
    return result;
  }

  const sameDay = isSameDay(state.one, state.two);

  // Compute the time difference and adjust the end date while accounting for
  // shifts due to Daylight Savings Time. We do this first since the time difference
  // can shift the days in th date difference.
  let millis: number;
  if (sameDay) {
    // Special case: found a bug in Temporal that caused it to fail with a
    // "mixed-sign values not allowed as duration fields" error on the following two
    // dates:
    //    zone = "America/Vancouver"
    //   date1 = epoch 1762074000000 "2025-11-02 01:00:00-08:00"
    //   date2 = epoch 1762070460000 "2025-11-02 01:01:00-07:00"
    //   date1.until(date2)
    //
    millis = state.epoch2 - state.date1.unixEpoch();
  } else {
    // Scan for time difference, adjust end date.
    [state.two, millis] = timeDifference(state);

    // Compute the difference between the date fields and store in the result.
    dateDifference(state, result);
  }

  // ==> At this point we have computed the YEAR, MONTH, WEEK, and DAY fields in the result.

  // Initialize the milliseconds delta
  result.millis = millis;

  // At least one time field was requested.
  if (!state.has(TimePeriodFieldFlag.DAY)) {
    // If DAY field is not requested, roll days into time
    // TODO: sign
    result.millis += result.day * CalendarConstants.ONE_DAY_MS;
    result.day = 0;
  }

  if (state.fractions) {
    if (state.smallestFlag <= TimePeriodFieldFlag.DAY) {
      rollDateFractions(state, result);
    } else {
      rollTimeFractions(state, result);
    }
    return result;
  }

  // Hack for rounding edge case
  if (
    state.has(TimePeriodFieldFlag.DAY) &&
    Math.abs(result.millis) >= 23 * CalendarConstants.ONE_HOUR_MS &&
    Math.abs(result.millis) <= 25 * CalendarConstants.ONE_HOUR_MS
  ) {
    roundResult(state, result);
  }

  // Set all time fields from the milliseconds field.
  rollTime(state, result);

  return result;
};

/**
 * Compute date difference.
 */
const dateDifference = (state: DifferenceState, result: TimePeriod) => {
  const { flags, one, two, incr, options } = state;

  // Seek towards the end date without exceeding it by guessing the year and month.
  let seek: YearMonth;

  if (state.has(TimePeriodFieldFlag.YEAR) || state.has(TimePeriodFieldFlag.MONTH)) {
    // In this block we use date 1 as our base and add or subtract years and months as we
    // approach date 2 without exceeding it.

    // Initial guess for the years difference.
    let guessYears = two.year - one.year;
    if (guessYears !== 0) {
      guessYears -= incr;
    }

    // Adjust the year to approach the end date without exceeding it.
    while (!greaterThanYMD(incr, one.year + guessYears, one.month, one.day, two)) {
      result.year = guessYears;
      guessYears += incr;
    }

    // Initial guess for the months difference.
    let guessMonths = incr;
    let seek = adjustYM(one.year + result.year, one.month + guessMonths);

    // Adjust the month to approach the end date without exceeding it.
    while (!greaterThanYMD(incr, seek.year, seek.month, one.day, two)) {
      result.month = guessMonths;
      guessMonths += incr;
      seek = adjustYM(seek.year, seek.month + incr);
    }

    if (!state.has(TimePeriodFieldFlag.YEAR)) {
      // Result does not include YEAR, so it must include MONTH due to the condition
      // on the outer block.
      // Result includes MONTH but not YEAR, translate years to months.
      result.month += result.year * 12;
      result.year = 0;
    } else {
      // Result includes YEAR.
      if (!state.has(TimePeriodFieldFlag.MONTH)) {
        // Result includes YEAR but not MONTH.
        if (
          (!state.fractions && state.smallest(TimePeriodFieldFlag.YEAR)) ||
          !state.smallest(TimePeriodFieldFlag.YEAR)
        ) {
          // If YEAR is the smallest field and we're not rolling up fractions, or
          // YEAR is not the smallest field, zero the months. The months will be
          // rolled into the days field later.
          result.month = 0;
        }
      }
    }
  }

  // Finalize values for years and months by clamping them to a valid range.
  seek = adjustYM(one.year + result.year, one.month + result.month);
  let clamped = clampYMD(seek.year, seek.month, one.day);

  // Compute final number of days. If the years and months were't set in the
  // result above, the days will span the whole range.
  let day =
    ymdToJD(two.year, two.month, two.day, state.monthCount) -
    ymdToJD(clamped.year, clamped.month, clamped.day, state.monthCount);

  // Optionally translate weeks to days
  let week = 0;
  if ((options.includeWeeks && (!flags || flags === DEFAULT_FLAGS)) || state.has(TimePeriodFieldFlag.WEEK)) {
    week = Math.trunc(day / 7);
    day %= 7;
  }

  // Set the WEEK and DAY fields in the result.
  result.day = day;
  result.week = week;
};

/**
 * Compute time difference and adjust date while accounting for DST shifts.
 */
const timeDifference = (state: DifferenceState): [YearMonthDay, number] => {
  const { two, incr, ms2, ms1, zoneId } = state;

  // Intermediate YMD we increment to approach our end date without exeeding it.
  let intermediate: YearMonthDay;

  // Amount to shift the day
  let dayshift = 0;

  // Maximum day shift
  let maxshift = incr === 1 ? 2 : 1;

  // Check if the end time is lower than the start time.
  let delta = ms2 - ms1;
  if (Math.sign(delta) === -incr) {
    dayshift++;
  }

  // Loop, incrementing the end date and calc a difference between start and end times.
  // Guaranteed to loop at least once.
  for (; dayshift <= maxshift; dayshift++) {
    intermediate = adjustDays(two.year, two.month, two.day - dayshift * incr);

    const jd = ymdToJD(intermediate.year, intermediate.month, intermediate.day, state.monthCount);
    let epoch = unixEpochFromJD(jd, ms1);

    const wall = TZ.fromWall(zoneId, epoch);
    if (wall) {
      epoch = wall[0];
    }
    delta = state.epoch2 - epoch;
    if (Math.sign(delta) !== -state.incr) {
      break;
    }
  }

  return [intermediate!, delta];
};

/**
 * Return true if dates are on same day.
 */
const isSameDay = (one: YearMonthDay, two: YearMonthDay): boolean =>
  one.year === two.year && one.month === two.month && one.day === two.day;

/**
 * Perform rounding of the result. The goal here is to check if the
 * time component of the result in milliseconds is greater than the
 * length of the last full day period, and increment by 1 day.
 *
 * The length of a day can vary from 23-25 hours depending
 * on shifts due to Daylight Savings Time and the standard offset.
 */
const roundResult = (state: DifferenceState, result: TimePeriod) => {
  // Move to the start of the day.
  //
  // Example "2025-03-09 01:59:00" becomes "2025-03-09 00:00:00"
  const date = toYMD(state.date1.startOf('day'));

  // Add the date components.
  //
  // Example "2025-03-09 00:00:00" + "1 year, 1 month, 22 days"
  // becomes "2025-10-31 00:00:00"
  const start = dateAdd(date, {
    year: result.year,
    month: result.month,
    week: result.week,
    day: result.day,
  });

  // Compute the start Julian day, then add the local time-of-day milliseconds
  // and get the UNIX epoch timestamp.
  //
  // Example "2025-10-31 00:00:00" becomes "2025-10-31 01:59:00"
  const jd = ymdToJD(start.year, start.month, start.day, state.monthCount);
  let startEpoch = unixEpochFromJD(jd, state.ms1);

  // Get wall clock UNIX epoch timestamp.
  let wall = TZ.fromWall(state.date1.timeZoneId(), startEpoch);
  if (wall) {
    startEpoch = wall[0];
  }

  // Repeat the above to get the end date that is +/- 1 day after the start date.
  // The +1 or -1 increment depends on the direction of the comparison.
  //
  // Example "2025-10-31 00:00:00" with +1 day becomes "2025-11-01 00:00:00"
  const end = adjustDays(start.year, start.month, start.day + state.incr);
  const endJd = ymdToJD(end.year, end.month, end.day, state.monthCount);
  let endEpoch = unixEpochFromJD(endJd, state.ms1);
  wall = TZ.fromWall(state.date1.timeZoneId(), endEpoch);
  if (wall) {
    endEpoch = wall[0];
  }

  // Get the difference between start and end.
  const delta = endEpoch - startEpoch;

  // If the milliseconds of our time period exceeds the length of the last full day,
  // roll milliseconds into 1 day.
  if (state.has(TimePeriodFieldFlag.DAY) && Math.abs(result.millis) >= Math.abs(delta)) {
    const days = (result.millis / (state.incr * delta)) | 0;
    const remainder = result.millis - delta;
    result.day += days;
    result.millis = remainder;
  }
};

/**
 * WARNING: This is only designed to be used for small day increments, mainly
 * to support 1- or 2-day adjustments. We use Julian day in other calculations
 * which lets us directly add or subtract any number of days.
 *
 * Adjust the day parameter to correct for underflow and overflow of the
 * given year and month.
 *
 * For example: adding 3 days to "2024-01-30" returns "2024-02-02" and
 * subtracting 3 days from "2024-02-02" returns "2024-01-30".
 */
export const adjustDays = (year: number, month: number, day: number) => {
  ({ year, month } = adjustYM(year, month));
  if (day < 1) {
    ({ year, month } = adjustYM(year, month - 1));
    day += daysInMonth(year, month - 1);
  }
  if (day > daysInMonth(year, month - 1)) {
    day -= daysInMonth(year, month - 1);
    ({ year, month } = adjustYM(year, month + 1));
  }
  return { year, month, day };
};

/**
 * Return true if (y1, m1, d1) is greater than date2.
 */
const greaterThanYMD = (sign: number, y1: number, m1: number, d1: number, date2: YearMonthDay): boolean => {
  if (y1 !== date2.year) {
    if (sign * (y1 - date2.year) > 0) {
      return true;
    }
  } else if (m1 !== date2.month) {
    if (sign * (m1 - date2.month) > 0) {
      return true;
    }
  } else if (d1 !== date2.day) {
    if (sign * (d1 - date2.day) > 0) {
      return true;
    }
  }
  return false;
};

/**
 * Roll milliseconds into all time fields.
 */
const rollTime = (state: DifferenceState, result: TimePeriod) => {
  if (state.has(TimePeriodFieldFlag.HOUR)) {
    result.hour = (result.millis / CalendarConstants.ONE_HOUR_MS) | 0;
    result.millis -= result.hour * CalendarConstants.ONE_HOUR_MS;
  }
  if (state.has(TimePeriodFieldFlag.MINUTE)) {
    result.minute = (result.millis / CalendarConstants.ONE_MINUTE_MS) | 0;
    result.millis -= result.minute * CalendarConstants.ONE_MINUTE_MS;
  }
  if (state.has(TimePeriodFieldFlag.SECOND)) {
    result.second = (result.millis / CalendarConstants.ONE_SECOND_MS) | 0;
    result.millis -= result.second * CalendarConstants.ONE_SECOND_MS;
  }
  if (!state.has(TimePeriodFieldFlag.MILLIS)) {
    result.millis = 0;
  }
};

/**
 * One of the date fields is the smallest field requested, so
 * roll up smaller fields into fractions of a larger field.
 */
const rollDateFractions = (state: DifferenceState, result: TimePeriod) => {
  // Roll milliseconds into day.
  const days = result.day + result.millis / CalendarConstants.ONE_DAY_MS;
  result.millis = 0;

  if (state.smallest(TimePeriodFieldFlag.YEAR)) {
    result.year += result.month / state.monthCount + (result.week * 7 + days) / 365.25;
    result.month = result.week = result.day = 0;
  } else if (state.smallest(TimePeriodFieldFlag.MONTH)) {
    result.month += (result.week * 7 + days) / 30.44;
    result.week = result.day = 0;
  } else if (state.smallest(TimePeriodFieldFlag.WEEK)) {
    result.week += days / 7;
    result.day = 0;
  } else if (state.smallest(TimePeriodFieldFlag.DAY)) {
    result.day = days;
  }
};

/**
 * One of the time fields is the smallest field requested, so
 * roll up smaller fields into fractions of a larger field.
 */
const rollTimeFractions = (state: DifferenceState, result: TimePeriod) => {
  if (state.smallest(TimePeriodFieldFlag.HOUR)) {
    result.hour +=
      (result.minute * CalendarConstants.ONE_MINUTE_MS +
        result.second * CalendarConstants.ONE_SECOND_MS +
        result.millis) /
      CalendarConstants.ONE_HOUR_MS;
    result.minute = result.second = 0;
  }
  if (state.smallest(TimePeriodFieldFlag.MINUTE)) {
    result.minute = (result.second * CalendarConstants.ONE_MINUTE_MS + result.millis) / CalendarConstants.ONE_MINUTE_MS;
    result.second = 0;
  }
  if (state.smallest(TimePeriodFieldFlag.SECOND)) {
    result.second = result.millis / CalendarConstants.ONE_SECOND_MS;
  }

  // Finally if MILLIS not requested, zero it.
  if (!state.smallest(TimePeriodFieldFlag.MILLIS)) {
    result.millis = 0;
  }
};

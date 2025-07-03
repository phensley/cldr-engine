import { Temporal } from '@js-temporal/polyfill';
import { CalendarDate, TimePeriod } from '../../../src';

/**
 * Index the elements in an array with an incrementing 1-based number.
 */
export const enumerate = <T>(args: T[]): [number, T][] => {
  let i = 0;
  const res: [number, T][] = [];
  for (var arg of args) {
    i++;
    res.push([i, arg]);
  }
  return res;
};

/**
 * Format a number as a string with leading zeros of a given maximum width.
 */
export const zeropad = (n: number, w: number): string => {
  let s = `${n}`;
  w -= s.length;
  let r = '';
  while (w > 0) {
    r += '0';
    w--;
  }
  return r + s;
};

/**
 * Heap's algorithm for generating all permutations of an array.
 * We copy the array and modify the copy in-place, swapping the
 * position of at most 2 elements on each iteration.
 */
export function* heaps<T>(arr: T[]) {
  const copy: T[] = [...arr];
  const length = copy.length;
  const ctrl = new Array(length).fill(0);

  yield copy;
  let i = 0;
  while (i < length) {
    if (ctrl[i] < i) {
      if (i % 2 === 0) {
        swap(copy, 0, i);
      } else {
        swap(copy, ctrl[i], i);
      }
      yield copy;
      ctrl[i]++;
      i = 0;
    } else {
      ctrl[i] = 0;
      i++;
    }
  }
}

/**
 * Swap elements of an array at the i-th and j-th positions.
 */
const swap = <T>(arr: T[], i: number, j: number) => ([arr[i], arr[j]] = [arr[j], arr[i]]);

/**
 * Zip two arrays together and return pairs of their elements.
 */
export function* zip<T, S>(a: T[], b: S[]) {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    yield [a[i], b[i]] as [T, S];
  }
}

/**
 * Zip two arrays and return pairs of elements as a list.
 */
export const zipList = <T, S>(a: T[], b: S[]): [T, S][] => {
  const gen = zip(a, b);
  let res: [T, S][] = [];
  let next = gen.next();
  while (!next.done) {
    res.push(next.value);
    next = gen.next();
  }
  return res;
};

export interface FormatterOptions {
  includeZoneOffset?: boolean;
}

/**
 * Comparable formats for CLDR and Temporal.
 */
export class TemporalFormatter {
  private opts: FormatterOptions;
  constructor(opts?: FormatterOptions) {
    this.opts = opts || {};
  }

  dateString(d: Temporal.ZonedDateTime): string {
    return d.toPlainDate().toString();
  }
  dateTimeString(d: Temporal.ZonedDateTime): string {
    return `${d.toPlainDate().toString()} ${d.toPlainTime().toString()}${this.opts.includeZoneOffset ? d.offset : ''}`;
  }
  durationString(d: Temporal.Duration): string {
    return formatTimePeriod(durationToPeriod(d));
  }
}

/**
 * Comparable formats for CLDR and Temporal.
 */
export class CLDRFormatter {
  private opts: FormatterOptions;
  constructor(opts?: FormatterOptions) {
    this.opts = opts || {};
  }

  dateString(c: CalendarDate): string {
    return c.toDateString();
  }
  dateTimeString(c: CalendarDate): string {
    const { includeZoneOffset } = this.opts;
    return c.toDateTimeString({ includeZoneOffset, optionalMilliseconds: true });
  }
  periodString(p: Partial<TimePeriod>): string {
    return formatTimePeriod(p);
  }
}

const formatTimePeriod = (p: Partial<TimePeriod>): string => {
  let r = '';
  for (const [key, suffix] of TIME_PERIOD_FIELD_SUFFIX) {
    let n = p[key];
    if (n) {
      if (r.length) {
        r += ' ';
      }
      // Round all decimals to 3 places for convenience
      if ((n | 0) !== n) {
        n = Math.round(n * 1000) / 1000;
      }
      r += `${n}`;
      r += suffix;
    }
  }
  return r;
};

const TIME_PERIOD_FIELD_SUFFIX: [keyof TimePeriod, string][] = [
  ['year', 'y'],
  ['month', 'm'],
  ['week', 'w'],
  ['day', 'd'],
  ['hour', 'H'],
  ['minute', 'M'],
  ['second', 'S'],
  ['millis', 'ms'],
];

export const TIMEPERIOD_TO_DURATION_KEYS: [keyof TimePeriod, keyof Temporal.DurationLike][] = [
  ['year', 'years'],
  ['month', 'months'],
  ['week', 'weeks'],
  ['day', 'days'],
  ['hour', 'hours'],
  ['minute', 'minutes'],
  ['second', 'seconds'],
  ['millis', 'milliseconds'],
];

/**
 * Convert a partial CLDR TimePeriod into a Temporal Duration-like object.
 */
export const periodToDurationLike = (period: Partial<TimePeriod>): Temporal.DurationLike => {
  let r: Temporal.DurationLike = {};
  for (const [src, dst] of TIMEPERIOD_TO_DURATION_KEYS) {
    if (period[src] !== undefined) {
      let v = period[src];
      r[dst] = v;
    }
  }
  return r;
};

/**
 * Convert a Temporal Duration into a CLDR TimePeriod.
 */
export const durationToPeriod = (duration: Temporal.Duration): TimePeriod => {
  let r: TimePeriod = {
    year: 0,
    month: 0,
    week: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    millis: 0,
  };
  for (const [src, dst] of TIMEPERIOD_TO_DURATION_KEYS) {
    const v = duration[dst];
    if (v) {
      r[src] = v;
    }
  }
  return r;
};

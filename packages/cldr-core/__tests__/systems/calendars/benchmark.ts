import { Temporal } from '@js-temporal/polyfill';
import { hrtime } from 'process';
import { GregorianDate, TimePeriod } from '../../../src';
import { CalendarConstants } from '../../../src/systems/calendars/constants';
import { heaps, periodToDurationLike, TIMEPERIOD_TO_DURATION_KEYS, zipList } from './_utils';

// THIS IS RUN MANUALLY. Not automatic due to long run time.
// This scans a large range of epoch timestamps and calculates the until / since
// difference between them, comparing the output of all functions.

// (The benchmark times include construction of the date instances)
// The cldr-engine implementation of until / since is approximately 45x faster
// than @js-temporal/polyfill using Node.js v22.13.1.
// The cldr-engine implementation of addition is approximately 5x faster
// than @js-temporal/polyfill using Node.js v22.13.1.

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

const elapsed = (start: [number, number], end: [number, number]): number => {
  const s = start[0] * 1e3 + start[1] / 1e6;
  const e = end[0] * 1e3 + end[1] / 1e6;
  return Math.round((e - s) * 1000) / 1000;
};

const TEMPORAL_OPTS: Temporal.DifferenceOptions<
  'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
> = {
  largestUnit: 'year',
  smallestUnit: 'millisecond',
};

const benchmarkDifference = (epoch: number, zone: string, days: number, minutes: number) => {
  const limit = 86400 / (60 * minutes);

  console.log('DIFFERENCE');

  // Generate epoch timestamps to scan
  const seek = new Set<number>();
  const epochs: number[] = [];
  for (let i = 0; i < limit * 2; i++) {
    for (let j = 0; j < days; j++) {
      for (let k = 0; k < limit; k++) {
        const start = epoch - CalendarConstants.ONE_DAY_MS + i * minutes * CalendarConstants.ONE_MINUTE_MS;
        const end = start + j * CalendarConstants.ONE_DAY_MS + k * CalendarConstants.ONE_MINUTE_MS;
        for (const n of [start, end]) {
          if (seek.has(n)) {
            continue;
          }
          seek.add(n);
          epochs.push(n);
        }
      }
    }
  }

  const iterlimit = 200000;
  for (const cldr of [true, false]) {
    let iters = 0;
    const starttime = hrtime();
    for (let i = 0; i < epochs.length; i++) {
      const start = epochs[i];
      for (let j = i; j < epochs.length; j++) {
        const end = epochs[j];
        if (cldr) {
          const cdate1 = gregorian(start, zone);
          const cdate2 = gregorian(end, zone);
          cdate1.until(cdate2);
          cdate2.until(cdate1);
          cdate1.since(cdate2);
          cdate2.since(cdate1);
        } else {
          const tdate1 = Temporal.Instant.fromEpochMilliseconds(start).toZonedDateTimeISO(zone);
          const tdate2 = Temporal.Instant.fromEpochMilliseconds(end).toZonedDateTimeISO(zone);
          tdate1.until(tdate2, TEMPORAL_OPTS);
          tdate2.until(tdate1, TEMPORAL_OPTS);
          tdate1.since(tdate2, TEMPORAL_OPTS);
          tdate2.since(tdate1, TEMPORAL_OPTS);
        }
        iters++;
      }
      if (iters >= iterlimit) {
        break;
      }
    }
    const endtime = hrtime();
    const engine = cldr ? '    cldr' : 'temporal';
    console.log(`${engine} iters ${iters} in ${elapsed(starttime, endtime)} ms`);
  }
};

type Permutation = [Partial<TimePeriod>, Temporal.DurationLike, string];

export const timePeriodPermutations = (numbers: number[]): [Permutation[], Permutation[]] => {
  const positive: Permutation[] = [];
  const negative: Permutation[] = [];

  // Produce every permutation of the time period units and numbers.
  const generate = heaps(TIMEPERIOD_TO_DURATION_KEYS.map((k) => k[0]));
  let curr;
  while (((curr = generate.next()), !curr.done)) {
    const pos: Partial<TimePeriod> = {};
    const neg: Partial<TimePeriod> = {};
    for (const [unit, n] of zipList(curr.value, numbers)) {
      pos[unit] = n;
      neg[unit] = -n;
    }
    positive.push([pos, periodToDurationLike(pos), JSON.stringify(pos)]);
    negative.push([neg, periodToDurationLike(neg), JSON.stringify(neg)]);
  }
  return [positive, negative];
};

const benchmarkAddition = (epoch: number, zone: string, positive: Permutation[], negative: Permutation[]) => {
  console.log('ADDITION');
  const limit = 86400 / 60;
  const iterlimit = 400000;
  for (const cldr of [true, false]) {
    let iters = 0;
    const starttime = hrtime();
    for (let i = 0; i < limit * 2; i++) {
      const start = epoch - CalendarConstants.ONE_DAY_MS + i * CalendarConstants.ONE_MINUTE_MS;
      for (const periods of [positive, negative]) {
        for (const [period, duration] of periods) {
          if (cldr) {
            const cdate1 = gregorian(start, zone);
            const cdate2 = cdate1.add(period);
            cdate2.add(period);
          } else {
            const tdate1 = Temporal.Instant.fromEpochMilliseconds(start).toZonedDateTimeISO(zone);
            const tdate2 = tdate1.add(duration);
            tdate2.add(duration);
          }
          iters++;
        }
      }
      if (iters >= iterlimit) {
        break;
      }
    }
    const endtime = hrtime();
    const engine = cldr ? '    cldr' : 'temporal';
    console.log(`${engine} iters ${iters} in ${elapsed(starttime, endtime)} ms`);
  }
};

const VANCOUVER = 'America/Vancouver';

// Mar 9 2025, 1:00:00 AM -08:00 Vancouver time
// 1 hour before the Spring DST boundary
const epoch1 = 1741510800000;

// Nov 2, 2025 01:00:00 AM -08:00 Vancouver time
// 1 hour before the Fall DST boundary
const epoch2 = 1762070400000;

benchmarkDifference(epoch1, VANCOUVER, 10, 5);
benchmarkDifference(epoch2, VANCOUVER, 10, 5);

const [positive, negative] = timePeriodPermutations([1, 1, 2, 2, 0, 0, 0, 0]);

benchmarkAddition(epoch1, VANCOUVER, positive, negative);
benchmarkAddition(epoch2, VANCOUVER, positive, negative);

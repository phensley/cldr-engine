import { Temporal } from '@js-temporal/polyfill';
import { hrtime } from 'process';
import { CalendarDate, GregorianDate, TimePeriod } from '../../../src';
import { CalendarConstants } from '../../../src/systems/calendars/constants';
import {
  CLDRFormatter,
  heaps,
  periodToDurationLike,
  TemporalFormatter,
  TIMEPERIOD_TO_DURATION_KEYS,
  zipList,
} from './_utils';

// THIS IS RUN MANUALLY. Not automatic due to long run time.
// This scans a large range of epoch timestamps and calculates the until / since
// difference between them, comparing the output of all functions.

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

const VANCOUVER = 'America/Vancouver';

const TEMPORAL_OPTS: Temporal.DifferenceOptions<
  'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
> = {
  largestUnit: 'year',
  smallestUnit: 'millisecond',
};

type Permutation = [Partial<TimePeriod>, string];

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
    positive.push([pos, JSON.stringify(pos)]);
    negative.push([neg, JSON.stringify(neg)]);
  }
  return [positive, negative];
};

const scan = (epoch: number, zone: string, positive: Permutation[], negative: Permutation[]) => {
  const [starttime] = hrtime();
  const limit = 86400 / 60; // minutes

  const tempfmt = new TemporalFormatter({ includeZoneOffset: true });
  const cldrfmt = new CLDRFormatter({ includeZoneOffset: true });

  const cache: { [k: number]: [CalendarDate, string, Temporal.ZonedDateTime, string] } = {};

  // Avoid repetitive construction
  const lookup = (n: number): [CalendarDate, string, Temporal.ZonedDateTime, string] => {
    let cdate: CalendarDate;
    let cdatestr: string;
    let tdate: Temporal.ZonedDateTime;
    let tdatestr: string;

    let entry = cache[n];
    if (!entry) {
      cdate = gregorian(n, zone);
      cdatestr = cldrfmt.dateTimeString(cdate);
      tdate = Temporal.Instant.fromEpochMilliseconds(n).toZonedDateTimeISO(zone);
      tdatestr = tempfmt.dateTimeString(tdate);
      cache[n] = [cdate, cdatestr, tdate, tdatestr];
    } else {
      [cdate, cdatestr, tdate, tdatestr] = entry;
    }
    return [cdate, cdatestr, tdate, tdatestr];
  };

  const seen = new Set<string>();

  let iters = 0;
  let skips = 0;
  for (let i = 0; i < limit * 2; i++) {
    // Start 1 day before epoch and scan for 2 days
    const start = epoch - CalendarConstants.ONE_DAY_MS + i * CalendarConstants.ONE_MINUTE_MS;
    const [cldr1, cldr1str, temp1, temp1str] = lookup(start);

    console.log(`start ${cldrfmt.dateTimeString(cldr1)}`);

    if (cldr1str !== temp1str) {
      console.log(`ERROR: "${cldr1str}" != "${temp1str}" zone ${zone}`);
      continue;
    }

    for (const periods of [positive, negative]) {
      for (const [period, repr] of periods) {
        const cldr2 = cldr1.add(period);
        const cldr2str = cldrfmt.dateTimeString(cldr1);

        // Memoize to skip redundant comparisons
        const key = cldr1str + ' ' + cldr2str;
        if (seen.has(key)) {
          skips++;
          continue;
        }
        seen.add(key);

        const temp2 = temp1.add(periodToDurationLike(period));
        const temp2str = tempfmt.dateTimeString(temp1);

        if (cldr2str !== temp2str) {
          console.log(`ERROR: "${cldr2str}" != "${temp2str}" zone ${zone} added ${repr}`);
          continue;
        }

        const cuntil1 = cldr1.until(cldr2);
        const cuntil2 = cldr2.until(cldr1);
        const tuntil1 = temp1.until(temp2, TEMPORAL_OPTS);
        const tuntil2 = temp2.until(temp1, TEMPORAL_OPTS);

        let c1 = cldrfmt.periodString(cuntil1);
        let t1 = tempfmt.durationString(tuntil1);
        let c2 = cldrfmt.periodString(cuntil2);
        let t2 = tempfmt.durationString(tuntil2);

        if (c1 !== t1) {
          console.log(`ERROR: "${c1}" != "${t1}" test: ${start} until cldr2 in ${zone} added ${repr}`);
        }

        if (c2 !== t2) {
          console.log(`ERROR: "${c2}" != "${t2}" test: cldr2 until ${start} in ${zone} added ${repr}`);
        }

        const csince1 = cldr1.since(cldr2);
        const csince2 = cldr2.since(cldr1);
        const tsince1 = temp1.since(temp2, TEMPORAL_OPTS);
        const tsince2 = temp2.since(temp1, TEMPORAL_OPTS);

        c1 = cldrfmt.periodString(csince1);
        t1 = tempfmt.durationString(tsince1);
        c2 = cldrfmt.periodString(csince2);
        t2 = tempfmt.durationString(tsince2);

        if (c1 !== t1) {
          console.log(`ERROR: "${c1}" != "${t1}" test: ${start} since cldr2 in ${zone} added ${repr}`);
        }

        if (c2 !== t2) {
          console.log(`ERROR: "${c2}" != "${t2}" test: cldr2 since ${start} in ${zone} added ${repr}`);
        }

        iters++;
      }
    }
  }
  const [endtime] = hrtime();
  const seconds = endtime - starttime;
  console.log(`total iterations ${iters}, skipped ${skips} in ${seconds} seconds`);
};

const NUMBERS_1 = [1, 1, 1, 1, 1, 1, 1, 1];
const NUMBERS_2 = [1, 2, 3, 4, 5, 6, 7, 8];

// Mar 9 2025, 1:00:00 AM -08:00 Vancouver time
// 1 hour before the Spring DST boundary
const epoch1 = 1741510800000;
scan(epoch1, VANCOUVER, ...timePeriodPermutations(NUMBERS_2));
scan(epoch1, VANCOUVER, ...timePeriodPermutations(NUMBERS_1));

// Nov 2, 2025, 1:00:00 AM -8:00 Vancouver time
// 1 hour before the Fall DST boundary
const epoch2 = 1762074000000;
scan(epoch2, VANCOUVER, ...timePeriodPermutations(NUMBERS_2));
scan(epoch2, VANCOUVER, ...timePeriodPermutations(NUMBERS_1));

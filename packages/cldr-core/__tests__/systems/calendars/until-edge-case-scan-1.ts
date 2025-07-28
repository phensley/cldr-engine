import { Temporal } from '@js-temporal/polyfill';
import { hrtime } from 'process';
import { GregorianDate } from '../../../src';
import { CalendarConstants } from '../../../src/systems/calendars/constants';
import { CLDRFormatter, TemporalFormatter } from './_utils';

// THIS IS RUN MANUALLY. Not automatic due to long run time.
// This scans a large range of epoch timestamps and calculates the until / since
// difference between them, comparing the output of all functions.

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

const scan = (epoch: number, zone: string, days: number, minutes: number) => {
  const [starttime] = hrtime();
  const limit = 86400 / (60 * minutes);

  const tempfmt = new TemporalFormatter({ includeZoneOffset: true });
  const cldrfmt = new CLDRFormatter({ includeZoneOffset: true });

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

  console.log(`epochs ${epochs.length}`);

  let iters = 0;
  let skips = 0;
  for (let i = 0; i < epochs.length; i++) {
    const start = epochs[i];

    const cdate1 = gregorian(start, zone);
    const cdate1str = cldrfmt.dateTimeString(cdate1);
    const tdate1 = Temporal.Instant.fromEpochMilliseconds(start).toZonedDateTimeISO(zone);
    const tdate1str = tempfmt.dateTimeString(tdate1);

    const iterstart = hrtime();
    if (cdate1str !== tdate1str) {
      console.log(`ERROR: "${cdate1str}" != "${cdate1str}" zone ${zone}`);
      continue;
    }

    for (let j = i; j < epochs.length; j++) {
      const end = epochs[j];

      const cdate2 = gregorian(end, zone);
      const cdate2str = cldrfmt.dateTimeString(cdate2);
      const tdate2 = Temporal.Instant.fromEpochMilliseconds(end).toZonedDateTimeISO(zone);
      const tdate2str = tempfmt.dateTimeString(tdate2);

      if (cdate2str !== tdate2str) {
        console.log(`ERROR: "${cdate2str}" != "${cdate2str}" zone ${zone}`);
        continue;
      }

      const cuntil1 = cdate1.until(cdate2);
      const cuntil2 = cdate2.until(cdate1);

      let tuntil1: Temporal.Duration;
      let tuntil2: Temporal.Duration;
      try {
        tuntil1 = tdate1.until(tdate2, TEMPORAL_OPTS);
        tuntil2 = tdate2.until(tdate1, TEMPORAL_OPTS);
      } catch (e) {
        console.log(`TEMPORAL ERROR: ${e} for start ${start} end ${end}`);
        continue;
      }

      let c1 = cldrfmt.periodString(cuntil1);
      let t1 = tempfmt.durationString(tuntil1);
      let c2 = cldrfmt.periodString(cuntil2);
      let t2 = tempfmt.durationString(tuntil2);

      if (c1 !== t1) {
        console.log(`ERROR: "${c1}" != "${t1}" test: ${start} until ${end} in ${zone}`);
      }

      if (c2 !== t2) {
        console.log(`ERROR: "${c2}" != "${t2}" test: ${end} until ${start} in ${zone}`);
      }

      const csince1 = cdate1.since(cdate2);
      const csince2 = cdate2.since(cdate1);

      let tsince1: Temporal.Duration;
      let tsince2: Temporal.Duration;

      try {
        tsince1 = tdate1.since(tdate2, TEMPORAL_OPTS);
        tsince2 = tdate2.since(tdate1, TEMPORAL_OPTS);
      } catch (e) {
        console.log(`TEMPORAL ERROR: ${e} for start ${start} end ${end}`);
        continue;
      }

      c1 = cldrfmt.periodString(csince1);
      t1 = tempfmt.durationString(tsince1);
      c2 = cldrfmt.periodString(csince2);
      t2 = tempfmt.durationString(tsince2);

      if (c1 !== t1) {
        console.log(`ERROR: "${c1}" != "${t1}" test: ${start} since ${end} in ${zone}`);
      }

      if (c2 !== t2) {
        console.log(`ERROR: "${c2}" != "${t2}" test: ${end} since ${start} in ${zone}`);
      }

      iters++;
    }
    const iterend = hrtime();
    console.log(`start ${cdate1str} ${elapsed(iterstart, iterend)} ms`);
  }
  const [endtime] = hrtime();
  const seconds = endtime - starttime;
  console.log(`total iterations ${iters}, skipped ${skips} in ${seconds} seconds`);
};

const VANCOUVER = 'America/Vancouver';

// Mar 9 2025, 1:00:00 AM -08:00 Vancouver time
// 1 hour before the Spring DST boundary
scan(1741510800000, VANCOUVER, 10, 5);

// Nov 2, 2025 01:00:00 AM -08:00 Vancouver time
// 1 hour before the Fall DST boundary
scan(1762070400000, VANCOUVER, 10, 5);

import { Temporal } from '@js-temporal/polyfill';
import { CalendarDate, GregorianDate, TimePeriod, TimePeriodField } from '../../../src';
import {
  FEB_28_2024,
  FEB_29_2024,
  JAN_30_2024,
  MAR_03_2024,
  MAR_09_2025,
  NEW_YORK,
  VANCOUVER,
} from './_referencedates';
import { CLDRFormatter, enumerate, periodToDurationLike, TemporalFormatter } from './_utils';

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

const CLDRFMT = new CLDRFormatter({ includeZoneOffset: true });
const TEMPFMT = new TemporalFormatter({ includeZoneOffset: true });

// Run epoch timestamp-based test cases from test262 repository.
const test262 = (epoch1: number, epoch2: number, zoneId: string, debug?: boolean) => {
  const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch1).toZonedDateTimeISO(zoneId);
  const temp2 = Temporal.Instant.fromEpochMilliseconds(epoch2).toZonedDateTimeISO(zoneId);
  const cldr1 = gregorian(epoch1, zoneId);
  const cldr2 = gregorian(epoch2, zoneId);

  const tuntil = temp1.until(temp2, { largestUnit: 'months' });
  const cuntil = cldr1.until(cldr2);
  expect(TEMPFMT.durationString(tuntil)).toEqual(CLDRFMT.periodString(cuntil));
  if (debug) {
    console.log(CLDRFMT.periodString(cuntil));
  }
};

// test/intl402/Temporal/ZonedDateTime/prototype/until/dst-month-day-boundary.js
test('temporal test262 dst-month-day-boundary', () => {
  test262(
    // 2000-05-02T02:00-07:00 local
    957258000000,
    // 2000-04-02T03:00-07:00 local
    954669600000,
    'America/Vancouver',
  );
});

// test/intl402/Temporal/ZonedDateTime/prototype/until/dst-balancing-result.js
test('temporal test262 dst-balancing-result', () => {
  test262(
    // 2000-01-29T00-08 local
    949132800000,
    // 2000-10-29T23-08 local
    972889200000,
    'America/Vancouver',
  );
});

// test/intl402/Temporal/ZonedDateTime/prototype/until/dst-rounding-result.js
test('temporal test262 dst-rounding-result 1', () => {
  test262(
    // 2000-02-18T10Z
    // 2000-01-29T00-08 local
    949132800000,
    // 2000-04-02T21Z
    // 2000-10-29T23-08 local
    972889200000,
    'America/Vancouver',
  );
});

test('temporal test262 dst-rounding-result 2', () => {
  test262(
    // 2000-03-02T10Z
    // 2000-03-02T02-08 local
    951991200000,
    // 2000-04-17T21Z
    // 2000-04-17T14-07 local
    956005200000,
    'America/Vancouver',
  );
});

// test/intl402/Temporal/ZonedDateTime/prototype/until/sub-minute-offset.js
test('temporal test262 sub-minute-offset', () => {
  test262(
    // 1970-01-01 00:00:00-00:44:30
    0,
    // 1970-01-01T00:44:30-00:44:30
    5340000,
    'Africa/Monrovia',
  );
});

const edgeCaseAdd = (epoch: number, zone: string, added: Partial<TimePeriod>) => {
  const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch).toZonedDateTimeISO(zone);
  const cldr1 = gregorian(epoch, zone);
  const cldr2 = cldr1.add(added);
  const temp2 = temp1.add(periodToDurationLike(added));
  expect(CLDRFMT.dateTimeString(cldr2)).toEqual(TEMPFMT.dateTimeString(temp2));
  const tuntil = temp1.until(temp2, { largestUnit: 'year', smallestUnit: 'millisecond' });
  const cuntil = cldr1.until(cldr2);
  expect(CLDRFMT.periodString(cuntil)).toEqual(TEMPFMT.durationString(tuntil));
};

const cldrUntil = (epoch1: number, epoch2: number, zone: string): string => {
  const cldr1 = gregorian(epoch1, zone);
  const cldr2 = gregorian(epoch2, zone);
  const cuntil = cldr1.until(cldr2);
  console.log(CLDRFMT.dateTimeString(cldr1), cldr1.toISOString());
  console.log(CLDRFMT.dateTimeString(cldr2), cldr2.toISOString());
  return CLDRFMT.periodString(cuntil);
};

const tempUntil = (epoch1: number, epoch2: number, zone: string): string => {
  const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch1).toZonedDateTimeISO(zone);
  const temp2 = Temporal.Instant.fromEpochMilliseconds(epoch2).toZonedDateTimeISO(zone);
  const tuntil = temp1.until(temp2, { largestUnit: 'year', smallestUnit: 'millisecond' });
  console.log(TEMPFMT.dateTimeString(temp1), TEMPFMT.dateTimeString(temp2));
  return TEMPFMT.durationString(tuntil);
};

test('api comment examples', () => {
  let cuntil: string;
  let tuntil: string;

  const epoch1 = 1706634000000; // 2024-01-30
  const epoch2 = 1709485200000; // 2024-03-03
  cuntil = cldrUntil(epoch1, epoch2, NEW_YORK);
  tuntil = tempUntil(epoch1, epoch2, NEW_YORK);
  expect(cuntil).toEqual(tuntil);

  cuntil = cldrUntil(epoch2, epoch1, NEW_YORK);
  tuntil = tempUntil(epoch2, epoch1, NEW_YORK);
  expect(cuntil).toEqual(tuntil);
});

test('edge case 1', () => {
  edgeCaseAdd(MAR_09_2025, 'America/New_York', { year: 1, second: 2, minute: 3, day: 4, millis: 5, month: 6, week: 7 });
});

test('edge case 2', () => {
  const cuntil = cldrUntil(1742205000000, 1741517400000, VANCOUVER);
  const tuntil = tempUntil(1742205000000, 1741517400000, VANCOUVER);
  expect(cuntil).toEqual(tuntil);
});

// Filed bug 1 https://github.com/js-temporal/temporal-polyfill/issues/347
test('temporal bug 1', () => {
  const epoch1 = 1762070460000;
  const epoch2 = 1762074000000;

  let cuntil = cldrUntil(epoch1, epoch2, VANCOUVER);
  expect(cuntil).toEqual('59M');
  cuntil = cldrUntil(epoch2, epoch1, VANCOUVER);
  expect(cuntil).toEqual('-59M');

  // Blows up Temporal with error:
  // RangeError: mixed-sign values not allowed as duration fields
  expect(() => tempUntil(epoch1, epoch2, VANCOUVER)).toThrowError();
  expect(() => tempUntil(epoch2, epoch1, VANCOUVER)).toThrowError();
});

test('bug 2 cldr', () => {
  const toString = (d: CalendarDate) => `${d.toDateTimeString({ includeZoneOffset: true })}`;
  const until = (epoch1: number, epoch2: number, zone: string) => {
    const date1 = gregorian(epoch1, zone);
    const date2 = gregorian(epoch2, zone);
    const result = date1.until(date2);
    console.log(`${toString(date1)} until ${toString(date2)} is ${CLDRFMT.periodString(result)}`);
  };

  const zone = 'America/New_York';

  // 2025-11-02 04:00:00 UTC
  // 2025-11-02 00:00:00-0400 local, midnight before DST shift.
  const midnight = 1762056000000;

  // 2025-11-02 05:59:00 UTC
  // 2025-11-02 01:59:00-04:00 local, first 1:59 before DST shift.
  const first_0159 = 1762063140000;

  // 2025-11-02 06:59:00 UTC
  // 2025-11-02 01:59:00-05:00 local, second 1:59 after DST shift.
  const second_0159 = 1762066740000;

  // 2025-11-02 23:00:00 UTC
  // 2025-11-02 18:00:00-05:00 local, evening in day of DST shift.
  const evening = 1762124400000;

  until(midnight, first_0159, zone);
  //> 2025-11-02T00:00:00-04:00 until 2025-11-02T01:59:00-04:00 is PT1H59M

  until(first_0159, midnight, zone);
  //> 2025-11-02T01:59:00-04:00 until 2025-11-02T00:00:00-04:00 is -PT1H59M

  until(midnight, second_0159, zone);
  //> 2025-11-02T00:00:00-04:00 until 2025-11-02T01:59:00-05:00 is PT2H59M

  until(second_0159, midnight, zone);
  //> 2025-11-02T01:59:00-05:00 until 2025-11-02T00:00:00-04:00 is -PT1H59M

  until(first_0159, second_0159, zone);
  //> 2025-11-02T01:59:00-04:00 until 2025-11-02T01:59:00-05:00 is PT1H

  until(second_0159, first_0159, zone);
  //> 2025-11-02T01:59:00-05:00 until 2025-11-02T01:59:00-04:00 is PT0S

  until(first_0159, evening, zone);
  //> 2025-11-02T01:59:00-04:00 until 2025-11-02T23:53:00-05:00 is PT22H54M

  until(evening, first_0159, zone);
  //> 2025-11-02T23:53:00-05:00 until 2025-11-02T01:59:00-04:00 is -PT22H54M

  until(second_0159, evening, zone);
  //> 2025-11-02T01:59:00-05:00 until 2025-11-02T23:53:00-05:00 is PT22H54M

  until(evening, second_0159, zone);
  //> 2025-11-02T23:53:00-05:00 until 2025-11-02T01:59:00-05:00 is -PT21H54M
});

test('temporal bug 2 reproduction', () => {
  const toString = (d: Temporal.ZonedDateTime) => `${d.toPlainDateTime().toString() + d.offset}`;
  const until = (epoch1: number, epoch2: number, zone: string) => {
    const date1 = Temporal.Instant.fromEpochMilliseconds(epoch1).toZonedDateTimeISO(zone);
    const date2 = Temporal.Instant.fromEpochMilliseconds(epoch2).toZonedDateTimeISO(zone);
    const result = date1.until(date2, { largestUnit: 'year', smallestUnit: 'millisecond' });
    console.log(`${toString(date1)} until ${toString(date2)} is ${result.toString()}`);
  };

  const zone = 'America/New_York';

  // 2025-11-02 04:00:00 UTC
  // 2025-11-02 00:00:00-0400 local, midnight before DST shift.
  const midnight = 1762056000000;

  // 2025-11-02 05:59:00 UTC
  // 2025-11-02 01:59:00-04:00 local, first 1:59 before DST shift.
  const first_0159 = 1762063140000;

  // 2025-11-02 06:59:00 UTC
  // 2025-11-02 01:59:00-05:00 local, second 1:59 after DST shift.
  const second_0159 = 1762066740000;

  // 2025-11-02 23:00:00 UTC
  // 2025-11-02 18:00:00-05:00 local, evening in day of DST shift.
  const evening = 1762124400000;

  until(midnight, first_0159, zone);
  //> 2025-11-02T00:00:00-04:00 until 2025-11-02T01:59:00-04:00 is PT1H59M

  until(first_0159, midnight, zone);
  //> 2025-11-02T01:59:00-04:00 until 2025-11-02T00:00:00-04:00 is -PT1H59M

  until(midnight, second_0159, zone);
  //> 2025-11-02T00:00:00-04:00 until 2025-11-02T01:59:00-05:00 is PT2H59M

  until(second_0159, midnight, zone);
  //> 2025-11-02T01:59:00-05:00 until 2025-11-02T00:00:00-04:00 is -PT1H59M

  until(first_0159, second_0159, zone);
  //> 2025-11-02T01:59:00-04:00 until 2025-11-02T01:59:00-05:00 is PT1H

  until(second_0159, first_0159, zone);
  //> 2025-11-02T01:59:00-05:00 until 2025-11-02T01:59:00-04:00 is PT0S

  until(first_0159, evening, zone);
  //> 2025-11-02T01:59:00-04:00 until 2025-11-02T23:53:00-05:00 is PT22H54M

  until(evening, first_0159, zone);
  //> 2025-11-02T23:53:00-05:00 until 2025-11-02T01:59:00-04:00 is -PT22H54M

  until(second_0159, evening, zone);
  //> 2025-11-02T01:59:00-05:00 until 2025-11-02T23:53:00-05:00 is PT22H54M

  until(evening, second_0159, zone);
  //> 2025-11-02T23:53:00-05:00 until 2025-11-02T01:59:00-05:00 is -PT21H54M
});

test('date-only utc', () => {
  // Format for each test case below:
  // [date1, days-added, fields, date2, duration-since]
  //
  //  date1 + days-added = date2
  //  date1.since(date2, { fields }) == duration-since
  //
  // Empty duration '' means all fields in the result were zero.
  //
  const cases: [number, number, TimePeriodField[], string, string][] = [
    // POSITIVE DURATIONS: date1.until(date2) where date1 < date2

    [JAN_30_2024, 0, [], '2024-01-30', ''],

    [JAN_30_2024, 28, [], '2024-02-27', '28d'],
    [JAN_30_2024, 29, [], '2024-02-28', '29d'],
    [JAN_30_2024, 30, [], '2024-02-29', '30d'],
    [JAN_30_2024, 31, [], '2024-03-01', '1m 1d'],
    [JAN_30_2024, 32, [], '2024-03-02', '1m 2d'],
    [JAN_30_2024, 33, [], '2024-03-03', '1m 3d'],

    [FEB_28_2024, 28, [], '2024-03-27', '28d'],
    [FEB_28_2024, 29, [], '2024-03-28', '1m'],
    [FEB_28_2024, 30, [], '2024-03-29', '1m 1d'],
    [FEB_28_2024, 31, [], '2024-03-30', '1m 2d'],
    [FEB_28_2024, 32, [], '2024-03-31', '1m 3d'],
    [FEB_28_2024, 33, [], '2024-04-01', '1m 4d'],

    [FEB_29_2024, 28, [], '2024-03-28', '28d'],
    [FEB_29_2024, 29, [], '2024-03-29', '1m'],
    [FEB_29_2024, 30, [], '2024-03-30', '1m 1d'],
    [FEB_29_2024, 31, [], '2024-03-31', '1m 2d'],
    [FEB_29_2024, 32, [], '2024-04-01', '1m 3d'],
    [FEB_29_2024, 33, [], '2024-04-02', '1m 4d'],

    [FEB_29_2024, 28, ['day'], '2024-03-28', '28d'],
    [FEB_29_2024, 29, ['day'], '2024-03-29', '29d'],
    [FEB_29_2024, 30, ['day'], '2024-03-30', '30d'],
    [FEB_29_2024, 31, ['day'], '2024-03-31', '31d'],
    [FEB_29_2024, 32, ['day'], '2024-04-01', '32d'],
    [FEB_29_2024, 33, ['day'], '2024-04-02', '33d'],

    // NEGATIVE DURATIONS: date1.until(date2) where date1 > date2

    [FEB_28_2024, -33, [], '2024-01-26', '-1m -2d'],

    [MAR_03_2024, -28, [], '2024-02-04', '-28d'],
    [MAR_03_2024, -29, [], '2024-02-03', '-1m'],
    [MAR_03_2024, -30, [], '2024-02-02', '-1m -1d'],
    [MAR_03_2024, -31, [], '2024-02-01', '-1m -2d'],
    [MAR_03_2024, -32, [], '2024-01-31', '-1m -3d'],
    [MAR_03_2024, -33, [], '2024-01-30', '-1m -4d'],

    // ROLLDOWNS

    [FEB_29_2024, 33, ['year', 'month'], '2024-04-02', '1m'],
    [FEB_29_2024, 33, ['month'], '2024-04-02', '1m'],
    [FEB_29_2024, 33, ['month', 'day'], '2024-04-02', '1m 4d'],
    [FEB_29_2024, 33, ['day'], '2024-04-02', '33d'],

    [FEB_29_2024, 400, ['year', 'month'], '2025-04-04', '1y 1m'],
    [FEB_29_2024, 400, ['year', 'month', 'day'], '2025-04-04', '1y 1m 6d'],
    [FEB_29_2024, 400, ['month', 'day'], '2025-04-04', '13m 6d'],
    [FEB_29_2024, 400, ['day'], '2025-04-04', '400d'],
  ];

  const cldrfmt = new CLDRFormatter();

  for (const [index, [epoch, day, fields, expDate, expDiff]] of enumerate(cases)) {
    const added: Partial<TimePeriod> = { day };
    const base = gregorian(epoch, 'UTC');
    const date = base.add(added);
    expect(date.toDateString(), `case ${index} add ${added} days`).toEqual(expDate);
    const until = base.until(date, { fields });
    expect(cldrfmt.periodString(until), `case ${index}: ${base.toDateString()} days ${day}`).toEqual(expDiff);
  }
});

test('date time utc', () => {
  // Format for each test case below:
  // [date1, days-added, fields, date2, duration-since]
  //
  //  date1 + days-added = date2
  //  date1.since(date2, { fields }) == duration-since
  //
  // Empty duration '' means all fields in the result were zero.
  //
  const cases: [number, Partial<TimePeriod>, string, string][] = [
    // POSITIVE DURATIONS: date1.until(date2) where date1 < date2

    [JAN_30_2024, { day: 28, hour: 1 }, '2024-02-27 14:30:00', '28d 1H'],
    [JAN_30_2024, { day: 29, hour: 2 }, '2024-02-28 15:30:00', '29d 2H'],
    [JAN_30_2024, { day: 30, hour: 2 }, '2024-02-29 15:30:00', '30d 2H'],
    [JAN_30_2024, { day: 31, hour: 1 }, '2024-03-01 14:30:00', '1m 1d 1H'],
    [JAN_30_2024, { day: 32 }, '2024-03-02 13:30:00', '1m 2d'],
    [JAN_30_2024, { day: 33 }, '2024-03-03 13:30:00', '1m 3d'],

    [
      JAN_30_2024,
      { day: 30, hour: 2, minute: 12, second: 34, millis: 567 },
      '2024-02-29 15:42:34.567',
      '30d 2H 12M 34S 567ms',
    ],

    [FEB_28_2024, { day: 28, hour: 3 }, '2024-03-27 16:30:00', '28d 3H'],
    [FEB_28_2024, { day: 29, hour: 1 }, '2024-03-28 14:30:00', '1m 1H'],
    [FEB_28_2024, { day: 30 }, '2024-03-29 13:30:00', '1m 1d'],
    [FEB_28_2024, { day: 31 }, '2024-03-30 13:30:00', '1m 2d'],
    [FEB_28_2024, { day: 32 }, '2024-03-31 13:30:00', '1m 3d'],
    [FEB_28_2024, { day: 33 }, '2024-04-01 13:30:00', '1m 4d'],

    [FEB_29_2024, { day: 28 }, '2024-03-28 13:30:00', '28d'],
    [FEB_29_2024, { day: 29 }, '2024-03-29 13:30:00', '1m'],
    [FEB_29_2024, { day: 30 }, '2024-03-30 13:30:00', '1m 1d'],
    [FEB_29_2024, { day: 31 }, '2024-03-31 13:30:00', '1m 2d'],
    [FEB_29_2024, { day: 32 }, '2024-04-01 13:30:00', '1m 3d'],
    [FEB_29_2024, { day: 33 }, '2024-04-02 13:30:00', '1m 4d'],

    // NEGATIVE DURATIONS: date1.until(date2) where date1 > date2

    [FEB_28_2024, { day: -33 }, '2024-01-26 13:30:00', '-1m -2d'],

    [MAR_03_2024, { day: -28 }, '2024-02-04 13:30:00', '-28d'],
    [MAR_03_2024, { day: -29 }, '2024-02-03 13:30:00', '-1m'],
    [MAR_03_2024, { day: -30 }, '2024-02-02 13:30:00', '-1m -1d'],
    [MAR_03_2024, { day: -31 }, '2024-02-01 13:30:00', '-1m -2d'],
    [MAR_03_2024, { day: -32 }, '2024-01-31 13:30:00', '-1m -3d'],
    [MAR_03_2024, { day: -33 }, '2024-01-30 13:30:00', '-1m -4d'],
  ];

  const temputil = new TemporalFormatter();
  const cldrutil = new CLDRFormatter();

  for (const [index, [epoch, added, expDate, expDiff]] of enumerate(cases)) {
    const _added = JSON.stringify(added);
    const msg = `case ${index} add ${_added}`;

    const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch).toZonedDateTimeISO('UTC');
    const temp2 = temp1.add(periodToDurationLike(added));
    const tuntil = temp1.until(temp2, { largestUnit: 'year', smallestUnit: 'milliseconds' });
    expect(temputil.dateTimeString(temp2), msg).toEqual(expDate);
    expect(temputil.durationString(tuntil), msg).toEqual(expDiff);

    const cldr1 = gregorian(epoch, 'UTC');
    const cldr2 = cldr1.add(added);
    const cuntil = cldr1.until(cldr2);
    expect(cldrutil.dateTimeString(cldr2), msg).toEqual(expDate);
    expect(cldrutil.periodString(cuntil), `case ${index}: ${cldr1.toDateTimeString()} add ${_added}`).toEqual(expDiff);
  }
});

test('rolldown utc', () => {
  // Format for each test case below:
  // [date1, days-added, fields, date2, duration-since]
  //
  //  date1 + days-added = date2
  //  date1.since(date2, { fields }) == duration-since
  //
  // Empty duration '' means all fields in the result were zero.
  //
  const cases: [number, Partial<TimePeriod>, TimePeriodField[], string, string][] = [
    // POSITIVE DURATIONS: date1.until(date2) where date1 < date2

    [JAN_30_2024, { day: 28, hour: 1 }, [], '2024-02-27 14:30:00', '28d 1H'],
    [JAN_30_2024, { day: 29, hour: 2 }, [], '2024-02-28 15:30:00', '29d 2H'],
    [JAN_30_2024, { day: 30, hour: 2 }, [], '2024-02-29 15:30:00', '30d 2H'],
    [JAN_30_2024, { day: 31, hour: 1 }, [], '2024-03-01 14:30:00', '1m 1d 1H'],
    [JAN_30_2024, { day: 32 }, [], '2024-03-02 13:30:00', '1m 2d'],
    [JAN_30_2024, { day: 33 }, [], '2024-03-03 13:30:00', '1m 3d'],

    [
      JAN_30_2024,
      { day: 30, hour: 2, minute: 12, second: 34, millis: 567 },
      [],
      '2024-02-29 15:42:34.567',
      '30d 2H 12M 34S 567ms',
    ],

    [FEB_28_2024, { day: 28, hour: 3 }, [], '2024-03-27 16:30:00', '28d 3H'],
    [FEB_28_2024, { day: 29, hour: 1 }, [], '2024-03-28 14:30:00', '1m 1H'],
    [FEB_28_2024, { day: 30 }, [], '2024-03-29 13:30:00', '1m 1d'],
    [FEB_28_2024, { day: 31 }, [], '2024-03-30 13:30:00', '1m 2d'],
    [FEB_28_2024, { day: 32 }, [], '2024-03-31 13:30:00', '1m 3d'],
    [FEB_28_2024, { day: 33 }, [], '2024-04-01 13:30:00', '1m 4d'],

    [FEB_29_2024, { day: 28 }, [], '2024-03-28 13:30:00', '28d'],
    [FEB_29_2024, { day: 29 }, [], '2024-03-29 13:30:00', '1m'],
    [FEB_29_2024, { day: 30 }, [], '2024-03-30 13:30:00', '1m 1d'],
    [FEB_29_2024, { day: 31 }, [], '2024-03-31 13:30:00', '1m 2d'],
    [FEB_29_2024, { day: 32 }, [], '2024-04-01 13:30:00', '1m 3d'],
    [FEB_29_2024, { day: 33 }, [], '2024-04-02 13:30:00', '1m 4d'],

    [FEB_29_2024, { day: 28 }, ['day'], '2024-03-28 13:30:00', '28d'],
    [FEB_29_2024, { day: 29 }, ['day'], '2024-03-29 13:30:00', '29d'],
    [FEB_29_2024, { day: 30 }, ['day'], '2024-03-30 13:30:00', '30d'],
    [FEB_29_2024, { day: 31 }, ['day'], '2024-03-31 13:30:00', '31d'],
    [FEB_29_2024, { day: 32 }, ['day'], '2024-04-01 13:30:00', '32d'],
    [FEB_29_2024, { day: 33 }, ['day'], '2024-04-02 13:30:00', '33d'],

    // // NEGATIVE DURATIONS: date1.until(date2) where date1 > date2

    [FEB_28_2024, { day: -33 }, [], '2024-01-26 13:30:00', '-1m -2d'],

    [MAR_03_2024, { day: -28 }, [], '2024-02-04 13:30:00', '-28d'],
    [MAR_03_2024, { day: -29 }, [], '2024-02-03 13:30:00', '-1m'],
    [MAR_03_2024, { day: -30 }, [], '2024-02-02 13:30:00', '-1m -1d'],
    [MAR_03_2024, { day: -31 }, [], '2024-02-01 13:30:00', '-1m -2d'],
    [MAR_03_2024, { day: -32 }, [], '2024-01-31 13:30:00', '-1m -3d'],
    [MAR_03_2024, { day: -33 }, [], '2024-01-30 13:30:00', '-1m -4d'],

    // ROLLDOWNS

    [FEB_29_2024, { day: 33 }, ['year', 'month'], '2024-04-02 13:30:00', '1m'],
    [FEB_29_2024, { day: 33 }, ['month'], '2024-04-02 13:30:00', '1m'],
    [FEB_29_2024, { day: 33 }, ['month', 'day'], '2024-04-02 13:30:00', '1m 4d'],
    [FEB_29_2024, { day: 33 }, ['day'], '2024-04-02 13:30:00', '33d'],

    [FEB_29_2024, { day: 400 }, ['year', 'month'], '2025-04-04 13:30:00', '1y 1m'],
    [FEB_29_2024, { day: 400 }, ['year', 'month', 'day'], '2025-04-04 13:30:00', '1y 1m 6d'],
    [FEB_29_2024, { day: 400 }, ['month', 'day'], '2025-04-04 13:30:00', '13m 6d'],
    [FEB_29_2024, { day: 400 }, ['day'], '2025-04-04 13:30:00', '400d'],
  ];

  const cldrutil = new CLDRFormatter();

  for (const [index, [epoch, added, fields, expDate, expDiff]] of enumerate(cases)) {
    const msg = `case ${index} add ${JSON.stringify(added)} fields ${JSON.stringify(fields)}`;
    const cldr1 = gregorian(epoch, 'UTC');
    const cldr2 = cldr1.add(added);
    const cuntil = cldr1.until(cldr2, { fields });
    expect(cldrutil.dateTimeString(cldr2), msg).toEqual(expDate);
    expect(cldrutil.periodString(cuntil), msg).toEqual(expDiff);
  }
});

test('rolldown combinations', () => {
  const cases: [number, Partial<TimePeriod>, string, [TimePeriodField[], string][]][] = [
    [
      JAN_30_2024,
      { day: 28, hour: 1, minute: 22, second: 33, millis: 444 },
      '2024-02-27 14:52:33.444',
      [
        // [[], /*                                      */ '28d 1H 22M 33S 444ms'],
        [['day' /*                                 */], '28d'],
        [['day', 'hour' /*                         */], '28d 1H'],
        [['day', 'hour', 'minute' /*               */], '28d 1H 22M'],
        [['day', 'hour', 'minute', 'second' /*     */], '28d 1H 22M 33S'],
        [['day', 'hour', 'minute', 'second', 'millis'], '28d 1H 22M 33S 444ms'],
        [['day', 'hour', /*     */ 'second', 'millis'], '28d 1H 1353S 444ms'],
        [['day', 'hour', /*               */ 'millis'], '28d 1H 1353444ms'],
        [['day', /*   */ 'minute', 'second', 'millis'], '28d 82M 33S 444ms'],
        [['day', /*             */ 'second', 'millis'], '28d 4953S 444ms'],
        [['day', /*                       */ 'millis'], '28d 4953444ms'],
        [['day', /*   */ 'minute' /*               */], '28d 82M'],
        [['day', /*   */ 'minute', 'second' /*     */], '28d 82M 33S'],

        [['hour' /*                         */], '673H'],
        [['hour', 'minute' /*               */], '673H 22M'],
        [['hour', 'minute', 'second' /*     */], '673H 22M 33S'],
        [['hour', 'minute', 'second', 'millis'], '673H 22M 33S 444ms'],
        [['hour', /*     */ 'second', 'millis'], '673H 1353S 444ms'],
        [['hour', /*               */ 'millis'], '673H 1353444ms'],
        [['hour', /*     */ 'second' /*     */], '673H 1353S'],

        [['minute'], '40402M'],
        [['minute', 'second'], '40402M 33S'],
        [['minute', 'second', 'millis'], '40402M 33S 444ms'],
        [['minute', /*     */ 'millis'], '40402M 33444ms'],
      ],
    ],
  ];

  const cldrutil = new CLDRFormatter();

  for (const [index, [epoch, added, expDate, subs]] of enumerate(cases)) {
    const msg = `case ${index} add ${JSON.stringify(added)}`;

    const cldr1 = gregorian(epoch, 'UTC');
    const cldr2 = cldr1.add(added);

    for (const [sub, [fields, duration]] of enumerate(subs)) {
      const cuntil = cldr1.until(cldr2, { fields });
      expect(cldrutil.dateTimeString(cldr2), msg).toEqual(expDate);
      expect(cldrutil.periodString(cuntil), msg + ` test ${sub} ${JSON.stringify(fields)} ${duration}:`).toEqual(
        duration,
      );
    }
  }
});

test('weeks', () => {
  // Ensure the multiple ways of requesting WEEKS, either by requesting
  // the field explicitly or enabling the 'includeWeeks' option.
  let end: CalendarDate;
  let until: TimePeriod;
  const cldrfmt = new CLDRFormatter();

  const start = gregorian(JAN_30_2024, 'America/New_York');

  end = start.add({ day: 21 });
  expect(cldrfmt.dateTimeString(end)).toEqual('2024-02-20 08:30:00');
  until = start.until(end, { fields: ['week'] });
  expect(cldrfmt.periodString(until)).toEqual('3w');

  end = start.add({ day: 21 });
  expect(cldrfmt.dateTimeString(end)).toEqual('2024-02-20 08:30:00');
  until = start.until(end, { includeWeeks: true });
  expect(cldrfmt.periodString(until)).toEqual('3w');
});

test('coverage adjustDays', () => {
  let end: CalendarDate;
  let until: TimePeriod;
  const cldrfmt = new CLDRFormatter();

  const start = gregorian(FEB_29_2024, 'America/New_York');

  // Cases to ensure adjustDays function coverage
  const cases: [number, string][] = [
    [-29 * 24, '-29d'],
    [-30 * 24, '-30d'],
    [-40 * 24, '-1m -9d'],
    [-500, '-20d -20H'],
    [-524, '-21d -20H'],
    [-695, '-28d -23H'],
  ];

  for (const [hour, expected] of cases) {
    end = start.add({ hour });
    until = start.until(end);
    expect(cldrfmt.periodString(until)).toEqual(expected);
  }
});

test('rollup fractions', () => {
  // These cases perform a "rollup" which rolls smaller fields into larger ones.
  // This is only really useful for relative time formatting where we express things like
  // "In 2.5 years", and the caller may want control over fractional values and rounding.
  const cases: [number, Partial<TimePeriod>, TimePeriodField[], string, string][] = [
    // POSITIVE DURATIONS: date1.until(date2) where date1 < date2

    [JAN_30_2024, { year: 1, month: 3 }, ['year'], '2025-04-30 13:30:00', '1.25y'],
    [JAN_30_2024, { year: 1, month: 3 }, ['month'], '2025-04-30 13:30:00', '15m'],
    [JAN_30_2024, { year: 1, month: 3, day: 91 }, ['month'], '2025-07-30 13:30:00', '18m'],
    [JAN_30_2024, { year: 1, month: 3, day: 91 }, ['year'], '2025-07-30 13:30:00', '1.5y'],
    [JAN_30_2024, { year: 1, month: 3, day: 98 }, ['month', 'week'], '2025-08-06 13:30:00', '18m 1w'],
    [JAN_30_2024, { year: 1, month: 3, day: 99 }, ['month', 'week', 'day'], '2025-08-07 13:30:00', '18m 1w 1d'],
    [JAN_30_2024, { year: 1, month: 3, day: 99 }, ['month', 'day'], '2025-08-07 13:30:00', '18m 8d'],
    [JAN_30_2024, { year: 1, month: 3, day: 99 }, ['month', 'hour'], '2025-08-07 13:30:00', '18m 192H'],
    [JAN_30_2024, { year: 1, month: 3, day: 99 }, ['month', 'week'], '2025-08-07 13:30:00', '18m 1.143w'],

    [JAN_30_2024, { month: 1, hour: 15 }, ['day'], '2024-03-01 04:30:00', '30.625d'],
    [JAN_30_2024, { month: 3 }, ['year'], '2024-04-30 13:30:00', '0.25y'],
  ];

  const cldrfmt = new CLDRFormatter();

  for (const [index, [epoch, added, fields, expDate, expDiff]] of enumerate(cases)) {
    const msg = `case ${index} add ${JSON.stringify(added)} fields ${JSON.stringify(fields)}`;
    const base = gregorian(epoch, 'UTC');
    const date = base.add(added);
    expect(date.toDateTimeString({ optionalMilliseconds: true }), msg).toEqual(expDate);
    const until = base.until(date, { fields, rollupFractional: true });
    expect(cldrfmt.periodString(until), msg).toEqual(expDiff);
  }
});

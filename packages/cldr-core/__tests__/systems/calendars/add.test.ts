import { Temporal } from '@js-temporal/polyfill';
import { CalendarDate, GregorianDate, TimePeriod } from '../../../src';
import {
  APR_02_2000,
  FEB_28_2024,
  FEB_29_2024,
  JAN_01_2000,
  MAR_03_2024,
  MAR_09_2025,
  NOV_02_2025,
} from './_referencedates';
import { CLDRFormatter, enumerate, periodToDurationLike, TemporalFormatter } from './_utils';

type TestCase = [number, Partial<TimePeriod>, string?];

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

const NY = 'America/New_York';

const ONE_HOUR_SECS = 3600;
const ONE_HOUR_MS = ONE_HOUR_SECS * 1000;

const tempstr = (t: Temporal.ZonedDateTime): string =>
  `${t.toPlainDate().toString()} ${t.toPlainTime().toString()}${t.offset}`;

const cldrstr = (c: CalendarDate): string =>
  c.toDateTimeString({ includeZoneOffset: true, optionalMilliseconds: true });

const edgeCase = (epoch: number, zone: string, added: Partial<TimePeriod>) => {
  const tempfmt = new TemporalFormatter({ includeZoneOffset: true });
  const cldrfmt = new CLDRFormatter({ includeZoneOffset: true });
  const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch).toZonedDateTimeISO(zone);
  const cldr1 = gregorian(epoch, zone);
  const cldr2 = cldr1.add(added);
  const temp2 = temp1.add(periodToDurationLike(added));
  expect(cldrfmt.dateTimeString(cldr2)).toEqual(tempfmt.dateTimeString(temp2));
};

test('edge case scan', () => {
  const epochs = [
    // Mar 9, 2025 06:59:00 UTC
    // Mar 9, 2025 01:59:00 NY (1 minute before the spring DST boundary)
    MAR_09_2025,
    // Nov 2, 2025 05:59:00 UTC
    // Nov 2, 2025 01:59:00 NY (1 minute before the fall DST boundary)
    NOV_02_2025,
  ];

  const zone = 'America/New_York';
  for (const epoch of epochs) {
    for (let i = 0; i < 8000; i++) {
      edgeCase(epoch, zone, { minute: i });
      edgeCase(epoch, zone, { minute: -i });
      edgeCase(epoch - i * 60000, zone, { minute: i });
      edgeCase(epoch + i * 60000, zone, { minute: -i });
    }
  }
});

test('edge case 1', () => {
  edgeCase(
    // Nov 2, 2025 05:59:00 UTC
    // Nov 2, 2025 01:59:00 NY (1 minute before the fall DST boundary)
    NOV_02_2025,
    'America/New_York',
    { day: -1, hour: -2, year: -3, minute: -4, second: -5, month: -6, week: -7 },
  );
});

test('edge case 2', () => {
  edgeCase(
    // Nov 2, 2025 05:59:00 UTC
    // Nov 2, 2025 01:59:00 NY (1 minute before the fall DST boundary)
    NOV_02_2025,
    'America/New_York',
    { week: 1, year: 2, day: 3, month: 4, hour: 5, minute: 6, second: 7 },
  );
  edgeCase(
    // Nov 2, 2025 05:59:00 UTC
    // Nov 2, 2025 01:59:00 NY (1 minute before the fall DST boundary)
    NOV_02_2025,
    'America/New_York',
    { week: 1, year: 2, day: 3, month: 4, minute: 6 },
  );
});

test('bad timezone', () => {
  let cldr2: CalendarDate;

  // Foo/Bar will resolve to UTC
  const cldr1 = gregorian(FEB_29_2024, 'Foo/Bar');

  cldr2 = cldr1.add({ year: 1, month: 2, day: 3 });
  expect(cldrstr(cldr2)).toEqual('2025-05-02 13:30:00+00:00');
});

test('future years timezone issues', () => {
  let cldr2: CalendarDate;

  // Known bugs due affecting years in the future due timezone
  // untils only being generated through 2037.
  // A future timezone library update will embed the trailing
  // rule and compute the offsets on the fly.

  const cldr1 = gregorian(FEB_29_2024, NY);

  cldr2 = cldr1.add({ year: 50 });
  expect(cldrstr(cldr2)).toEqual('2074-02-28 08:30:00-05:00');

  cldr2 = cldr1.add({ year: 50, month: 2 });
  expect(cldrstr(cldr2)).toEqual('2074-04-29 08:30:00-05:00'); // should be -04:00
});

test('mixed values', () => {
  let cldr2: CalendarDate;

  // Temporal does not support mixing positive and negative
  // values in a single addition operation.
  // An example would be "+1 month -1 second", to return the instant
  // just before an event 1 month in the future.
  // In Temporal you could do this in 2 calls (+1 month, then -1 second)
  // which is a bit more expensive.

  const cldr1 = gregorian(FEB_29_2024, NY);

  cldr2 = cldr1.add({ month: 1 });
  expect(cldrstr(cldr2)).toEqual('2024-03-29 08:30:00-04:00');

  cldr2 = cldr1.add({ month: 1, second: -1 });
  expect(cldrstr(cldr2)).toEqual('2024-03-29 08:29:59-04:00');
});

test('addition temporal compat spring dst', () => {
  let temp2: Temporal.ZonedDateTime;
  let cldr2: CalendarDate;

  // Eastern Time Spring Daylight Savings
  // Clocks ahead 1 hour from UTC-05 to UTC-04

  // March 9 2025 1:59:00 AM Eastern, 1 minute before the spring DST boundary.
  const epoch = MAR_09_2025;

  const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch).toZonedDateTimeISO(NY);
  const cldr1 = gregorian(epoch, NY);

  let expected = '2025-03-09 01:59:00-05:00';
  expect(tempstr(temp1)).toEqual(expected);
  expect(cldrstr(cldr1)).toEqual(expected);

  // Adding days DOES perform wall clock adjustment
  temp2 = temp1.add({ days: 1 });
  cldr2 = cldr1.add({ day: 1 });
  expected = '2025-03-10 01:59:00-04:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);
  // Time moved forward exactly 23 hours even though 1 day requested.
  expect((temp2.epochMilliseconds - temp1.epochMilliseconds) / ONE_HOUR_MS).toEqual(23);
  expect((cldr2.unixEpoch() - cldr1.unixEpoch()) / ONE_HOUR_MS).toEqual(23);

  temp2 = temp1.add({ days: 1, hours: 1 });
  cldr2 = cldr1.add({ day: 1, hour: 1 });
  expected = '2025-03-10 02:59:00-04:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);
  // Time moved forward 23 hours + 1 hour = 24 hours
  expect((temp2.epochMilliseconds - temp1.epochMilliseconds) / ONE_HOUR_MS).toEqual(24);
  expect((cldr2.unixEpoch() - cldr1.unixEpoch()) / ONE_HOUR_MS).toEqual(24);

  // Adding hours DOES NOT perform wall clock adjustment
  temp2 = temp1.add({ hours: 24 });
  cldr2 = cldr1.add({ hour: 24 });
  expected = '2025-03-10 02:59:00-04:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);
  // Time moved forward exactly 24 hours as requested
  expect((temp2.epochMilliseconds - temp1.epochMilliseconds) / ONE_HOUR_MS).toEqual(24);
  expect((cldr2.unixEpoch() - cldr1.unixEpoch()) / ONE_HOUR_MS).toEqual(24);

  temp2 = temp1.add({ months: 3 });
  cldr2 = cldr1.add({ month: 3 });
  expected = '2025-06-09 01:59:00-04:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);

  temp2 = temp1.add({ months: 3, hours: 1 });
  cldr2 = cldr1.add({ month: 3, hour: 1 });
  expected = '2025-06-09 02:59:00-04:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);

  temp2 = temp1.add({ years: 1, months: 1, hours: 1, minutes: 10 });
  cldr2 = cldr1.add({ year: 1, month: 1, hour: 1, minute: 10 });
  expected = '2026-04-09 03:09:00-04:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);

  temp2 = temp1.add({ years: 2, months: 9 });
  cldr2 = cldr1.add({ year: 2, month: 9 });
  expected = '2027-12-09 01:59:00-05:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);
});

test('addition temporal compat fall dst', () => {
  let temp2: Temporal.ZonedDateTime;
  let cldr2: CalendarDate;

  // Eastern Time Fall Daylight Savings
  // Clocks back 1 hour from UTC-04 to UTC-05

  // November 2 2025 1:59:00 AM Eastern, 1 minute before the fall DST boundary.
  const epoch0 = NOV_02_2025;

  const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch0).toZonedDateTimeISO(NY);
  const cldr1 = gregorian(epoch0, NY);

  let expected = '2025-11-02 01:59:00-04:00';
  expect(tempstr(temp1)).toEqual(expected);
  expect(cldrstr(cldr1)).toEqual(expected);

  temp2 = temp1.add({ hours: 1 });
  cldr2 = cldr1.add({ hour: 1 });
  expected = '2025-11-02 01:59:00-05:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);

  // Adding hours DOES NOT perform wall clock adjustment
  temp2 = temp1.add({ hours: 24 });
  cldr2 = cldr1.add({ hour: 24 });
  expected = '2025-11-03 00:59:00-05:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);
  // Time moved forward exactly 24 hours as requested
  expect((temp2.epochMilliseconds - temp1.epochMilliseconds) / ONE_HOUR_MS).toEqual(24);
  expect((cldr2.unixEpoch() - cldr1.unixEpoch()) / ONE_HOUR_MS).toEqual(24);

  // Adding days DOES perform wall clock adjustment
  temp2 = temp1.add({ days: 1 });
  cldr2 = cldr1.add({ day: 1 });
  expected = '2025-11-03 01:59:00-05:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);
  // Time moved forward exactly 25 hours even though 1 day requested.
  expect((temp2.epochMilliseconds - temp1.epochMilliseconds) / ONE_HOUR_MS).toEqual(25);
  expect((cldr2.unixEpoch() - cldr1.unixEpoch()) / ONE_HOUR_MS).toEqual(25);

  temp2 = temp1.add({ days: 1, hours: 1 });
  cldr2 = cldr1.add({ day: 1, hour: 1 });
  expected = '2025-11-03 02:59:00-05:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);

  // DOES perform wall clock adjustment
  temp2 = temp1.add({ months: 1 });
  cldr2 = cldr1.add({ month: 1 });
  expected = '2025-12-02 01:59:00-05:00';
  expect(tempstr(temp2)).toEqual(expected);
  expect(cldrstr(cldr2)).toEqual(expected);
  expect((temp2.epochMilliseconds - temp1.epochMilliseconds) / ONE_HOUR_MS)
    // 721 hours = 30 days, 1 hour
    .toEqual(721);
  expect((cldr2.unixEpoch() - cldr1.unixEpoch()) / ONE_HOUR_MS).toEqual(721);
});

test('addition temporal compat general', () => {
  const cases: TestCase[] = [
    // Weeks
    [MAR_03_2024, { week: 2 }, '2024-03-17 08:30:00-04:00'],
    [MAR_03_2024, { week: 52 }, '2025-03-02 08:30:00-05:00'],

    // Leap years
    [FEB_29_2024, { year: 4 }, '2028-02-29 08:30:00-05:00'],
    [FEB_29_2024, { year: 5 }, '2029-02-28 08:30:00-05:00'],
    [FEB_29_2024, { year: 5 }, '2029-02-28 08:30:00-05:00'],
    [FEB_28_2024, { year: 1 }, '2025-02-28 08:30:00-05:00'],

    [JAN_01_2000, { day: -20 }, '1999-12-12 12:30:00-05:00'],
    [JAN_01_2000, { day: -1 }, '1999-12-31 12:30:00-05:00'],
    [JAN_01_2000, { hour: -12 }, '2000-01-01 00:30:00-05:00'],
    [JAN_01_2000, { hour: -12, minute: -40 }, '1999-12-31 23:50:00-05:00'],

    // Subtraction
    [JAN_01_2000, { year: -4, month: -3 }, '1995-10-01 12:30:00-04:00'],
    [JAN_01_2000, { year: -19, month: -19 }, '1979-06-01 12:30:00-04:00'],
    [JAN_01_2000, { year: -29, month: -29 }, '1968-08-01 12:30:00-04:00'],
    [JAN_01_2000, { day: -1001 }, '1997-04-05 12:30:00-05:00'],
    [JAN_01_2000, { year: -109, second: -9 }, '1891-01-01 12:29:51-05:00'],
    [JAN_01_2000, { hour: -97, minute: -97, second: -97, millis: -97 }, '1999-12-28 09:51:22.903-05:00'],

    // Spring DST boundary 2025
    [MAR_09_2025, { minute: 0 }, '2025-03-09 01:59:00-05:00'],
    [MAR_09_2025, { minute: 1 }, '2025-03-09 03:00:00-04:00'],
    [MAR_09_2025, { year: 10 }, '2035-03-09 01:59:00-05:00'],
    [MAR_09_2025, { day: 2, hour: 17 }],
    [MAR_09_2025, { month: 17, day: 17, hour: 5 }],
    [MAR_09_2025, { year: 5, month: 25, day: 100, hour: 7, minute: 3, millis: 21 }],

    // Spring DST boundary 2000
    [APR_02_2000, { minute: 0 }, '2000-04-02 01:59:00-05:00'],
    [APR_02_2000, { minute: 1 }, '2000-04-02 03:00:00-04:00'],
    [APR_02_2000, { day: 30 }, '2000-05-02 01:59:00-04:00'],
    [APR_02_2000, { month: 1 }, '2000-05-02 01:59:00-04:00'],
    [APR_02_2000, { day: 31 }, '2000-05-03 01:59:00-04:00'],

    // Fall DST boundary 2025
    [NOV_02_2025, { minute: 0 }, '2025-11-02 01:59:00-04:00'],
    [NOV_02_2025, { minute: 1 }, '2025-11-02 01:00:00-05:00'],
    [NOV_02_2025, { year: 10 }, '2035-11-02 01:59:00-04:00'],

    // Test coverage
    [NOV_02_2025, { millis: 86400 * 2000 }, '2025-11-04 00:59:00-05:00'],
  ];

  checkCases(cases, gregorian);
});

type DateFunc = (epoch: number, zoneId: string) => CalendarDate;

const checkCases = (cases: TestCase[], datefunc: DateFunc) => {
  for (const [index, [epoch, added, expected]] of enumerate(cases)) {
    const temp1 = Temporal.Instant.fromEpochMilliseconds(epoch).toZonedDateTimeISO(NY);
    const cldr1 = datefunc(epoch, NY);
    let temp2 = temp1.add(periodToDurationLike(added));
    let cldr2 = cldr1.add(added);

    let msg = `case ${index} ${JSON.stringify(added)}`;
    if (expected !== undefined) {
      // Optional comparison to a known string for sanity-checking
      expect(cldrstr(cldr2), msg).toEqual(expected);
    }
    // Compare Temporal and CLDR results
    expect(tempstr(temp2), msg).toEqual(cldrstr(cldr2));
  }
};

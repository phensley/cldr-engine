import { BuddhistDate, GregorianDate, ISO8601Date, JapaneseDate, PersianDate } from '../../../src';
import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { LONDON, LOS_ANGELES, MAR_11_2000, NEW_YORK, TOKYO } from './_referencedates';

const DAY = 86400 * 1000;

const buddhist = (e: number, z: string) => BuddhistDate.fromUnixEpoch(e, z, 1, 1);
const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);
const iso8601 = (e: number, z: string) => ISO8601Date.fromUnixEpoch(e, z, 1, 1);
const japanese = (e: number, z: string) => JapaneseDate.fromUnixEpoch(e, z, 1, 1);
const persian = (e: number, z: string) => PersianDate.fromUnixEpoch(e, z, 1, 1);

test('leap year', () => {
  // January 31, 2024 8:30:00 AM GMT-05:00
  let s = gregorian(1706707800000, NEW_YORK);

  let q = s.add({ year: 1, month: 1 });
  expect(q.toString()).toEqual('Gregorian 2025-02-28 08:30:00.000 America/New_York');

  q = s.add({ year: 1, month: 1, day: 1 });
  expect(q.toString()).toEqual('Gregorian 2025-03-01 08:30:00.000 America/New_York');

  // February 29, 2024 8:30:00 AM GMT-05:00
  s = gregorian(1709213400000, NEW_YORK);

  q = s.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2025-02-28 08:30:00.000 America/New_York');

  q = s.add({ year: 1, day: 1 });
  expect(q.toString()).toEqual('Gregorian 2025-03-01 08:30:00.000 America/New_York');
});

test('fractional years', () => {
  const base = new Date(2004, 3, 11, 16, 34, 56); // Treat as UTC
  const utc = base.getTime() - base.getTimezoneOffset() * 60000;
  const date: GregorianDate = gregorian(utc, 'UTC');

  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2004-04-11 16:34:56.000 Etc/UTC');

  q = date.add({ year: 4.25 }); // truncated to 4
  expect(q.toString()).toEqual('Gregorian 2008-04-11 16:34:56.000 Etc/UTC');

  q = date.add({ year: 4, month: 3 });
  expect(q.toString()).toEqual('Gregorian 2008-07-11 16:34:56.000 Etc/UTC');

  q = date.add({ year: -4, month: -3 });
  expect(q.toString()).toEqual('Gregorian 2000-01-11 16:34:56.000 Etc/UTC');
});

test('year wrap', () => {
  const base = new Date(2000, 0, 10, 12, 0, 0); // Treat as UTC
  const utc = base.getTime() - base.getTimezoneOffset() * 60000;
  const date: GregorianDate = gregorian(utc, 'UTC');

  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-01-10 12:00:00.000 Etc/UTC');

  q = date.add({ day: -20 });
  expect(q.toString()).toEqual('Gregorian 1999-12-21 12:00:00.000 Etc/UTC');

  q = date.add({ month: -1 });
  expect(q.toString()).toEqual('Gregorian 1999-12-10 12:00:00.000 Etc/UTC');
});

test('years', () => {
  const date: GregorianDate = gregorian(MAR_11_2000, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2001-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: -3 });
  expect(q.toString()).toEqual('Gregorian 1997-03-11 03:00:25.000 America/New_York');

  // Earliest timezone offset for NY is LMT -4:56:2
  q = date.add({ year: -305 });
  expect(q.toString()).toEqual('Gregorian 1695-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: -1000 });
  expect(q.toString()).toEqual('Gregorian 1000-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1100 });
  expect(q.toString()).toEqual('Gregorian 3100-03-11 03:00:25.000 America/New_York');

  q = date.withZone(LOS_ANGELES);
  expect(q.toString()).toEqual('Gregorian 2000-03-11 00:00:25.000 America/Los_Angeles');
});

test('iso-8601 years', () => {
  const date: ISO8601Date = iso8601(MAR_11_2000, NEW_YORK);
  let q: ISO8601Date;
  expect(date.toString()).toEqual('ISO8601 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('ISO8601 2001-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: -5 });
  expect(q.toString()).toEqual('ISO8601 1995-03-11 03:00:25.000 America/New_York');
});

test('japanese years', () => {
  const date: JapaneseDate = japanese(MAR_11_2000, NEW_YORK);
  let q: JapaneseDate;
  expect(date.toString()).toEqual('Japanese 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Japanese 2001-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: -5 });
  expect(q.toString()).toEqual('Japanese 1995-03-11 03:00:25.000 America/New_York');
});

test('persian years', () => {
  const date: PersianDate = persian(MAR_11_2000, NEW_YORK);
  let q: PersianDate;
  expect(date.toString()).toEqual('Persian 1378-12-21 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Persian 1379-12-21 03:00:25.000 America/New_York');

  q = date.add({ year: -5 });
  expect(q.toString()).toEqual('Persian 1373-12-21 03:00:25.000 America/New_York');
});

test('buddhist years', () => {
  const date: BuddhistDate = buddhist(MAR_11_2000, NEW_YORK);
  let q: BuddhistDate;
  expect(date.toString()).toEqual('Buddhist 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Buddhist 2001-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: -5 });
  expect(q.toString()).toEqual('Buddhist 1995-03-11 03:00:25.000 America/New_York');
});

test('months', () => {
  const date: GregorianDate = gregorian(MAR_11_2000, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ month: 1 });
  expect(q.toString()).toEqual('Gregorian 2000-04-11 03:00:25.000 America/New_York');

  q = date.add({ month: 7 });
  expect(q.toString()).toEqual('Gregorian 2000-10-11 03:00:25.000 America/New_York');

  q = date.add({ month: 9 });
  expect(q.toString()).toEqual('Gregorian 2000-12-11 03:00:25.000 America/New_York');

  q = date.add({ month: -17 });
  expect(q.toString()).toEqual('Gregorian 1998-10-11 03:00:25.000 America/New_York');

  q = date.add({ month: -60 });
  expect(q.toString()).toEqual('Gregorian 1995-03-11 03:00:25.000 America/New_York');

  q = date.add({ month: -600 });
  expect(q.toString()).toEqual('Gregorian 1950-03-11 03:00:25.000 America/New_York');

  q = date.add({ month: 900 });
  expect(q.toString()).toEqual('Gregorian 2075-03-11 03:00:25.000 America/New_York');
});

test('month rollover', () => {
  // Sunday, March 31, 2019 12:30:45 PM
  const date: GregorianDate = gregorian(1554035445000, 'UTC');
  let q: GregorianDate;

  expect(date.toString()).toEqual('Gregorian 2019-03-31 12:30:45.000 Etc/UTC');

  q = date.add({ month: 1 });
  expect(q.toString()).toEqual('Gregorian 2019-04-30 12:30:45.000 Etc/UTC');

  q = date.add({ month: 2 });
  expect(q.toString()).toEqual('Gregorian 2019-05-31 12:30:45.000 Etc/UTC');

  q = date.add({ month: 3 });
  expect(q.toString()).toEqual('Gregorian 2019-06-30 12:30:45.000 Etc/UTC');

  q = date.add({ month: 4 });
  expect(q.toString()).toEqual('Gregorian 2019-07-31 12:30:45.000 Etc/UTC');

  q = date.add({ month: 5 });
  expect(q.toString()).toEqual('Gregorian 2019-08-31 12:30:45.000 Etc/UTC');

  q = date.add({ month: 6 });
  expect(q.toString()).toEqual('Gregorian 2019-09-30 12:30:45.000 Etc/UTC');
});

test('persian months', () => {
  let date: PersianDate = persian(MAR_11_2000, NEW_YORK);
  let q: PersianDate;
  expect(date.toString()).toEqual('Persian 1378-12-21 03:00:25.000 America/New_York');

  // Oddities show up with time and non-gregorian calendars, since the timezone
  // rules are based on the gregorian calendar. So adding 1 month below shifts
  // to the next persian year, but in gregorian calendar it crosses a daylight
  // savings boundary for America/New_York, so the hour changes.
  q = date.add({ month: 1 });
  expect(q.toString()).toEqual('Persian 1379-01-21 03:00:25.000 America/New_York');

  // Monday, March 21, 2022 12:34:54 PM UTC
  date = persian(1647880496000, NEW_YORK);
  expect(date.toString()).toEqual('Persian 1401-01-01 12:34:56.000 America/New_York');

  q = date.add({ month: 1 });
  expect(q.toString()).toEqual('Persian 1401-02-01 12:34:56.000 America/New_York');

  q = date.add({ month: 1.5 }); // truncated to 1
  expect(q.toString()).toEqual('Persian 1401-02-01 12:34:56.000 America/New_York');
});

test('days', () => {
  const date: GregorianDate = gregorian(MAR_11_2000, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ day: 1 });
  expect(q.toString()).toEqual('Gregorian 2000-03-12 03:00:25.000 America/New_York');

  q = date.add({ day: 15 });
  expect(q.toString()).toEqual('Gregorian 2000-03-26 03:00:25.000 America/New_York');

  // Crossing DST boundary
  q = date.add({ day: 30 });
  expect(q.toString()).toEqual('Gregorian 2000-04-10 03:00:25.000 America/New_York');

  q = date.add({ day: -45 });
  expect(q.toString()).toEqual('Gregorian 2000-01-26 03:00:25.000 America/New_York');

  q = date.add({ day: 450 });
  expect(q.toString()).toEqual('Gregorian 2001-06-04 03:00:25.000 America/New_York');

  q = date.add({ day: -3650 });
  expect(q.toString()).toEqual('Gregorian 1990-03-14 03:00:25.000 America/New_York');
});

test('weeks', () => {
  const date: GregorianDate = gregorian(MAR_11_2000, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');
  expect(date.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);

  q = date.add({ week: 1 });
  expect(q.toString()).toEqual('Gregorian 2000-03-18 03:00:25.000 America/New_York');
  expect(q.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);

  q = date.add({ week: 10 });
  expect(q.toString()).toEqual('Gregorian 2000-05-20 03:00:25.000 America/New_York');
  expect(q.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);

  q = date.add({ week: -52 });
  expect(q.toString()).toEqual('Gregorian 1999-03-13 03:00:25.000 America/New_York');
  expect(q.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);

  q = date.add({ week: 520 });
  expect(q.toString()).toEqual('Gregorian 2010-02-27 03:00:25.000 America/New_York');
  expect(q.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);
});

test('with zone', () => {
  const date: GregorianDate = gregorian(MAR_11_2000, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.withZone(LOS_ANGELES);
  expect(q.toString()).toEqual('Gregorian 2000-03-11 00:00:25.000 America/Los_Angeles');

  q = date.withZone(LONDON);
  expect(q.toString()).toEqual('Gregorian 2000-03-11 08:00:25.000 Europe/London');
});

test('hours', () => {
  const date: GregorianDate = gregorian(MAR_11_2000, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ hour: 5 });
  expect(q.toString()).toEqual('Gregorian 2000-03-11 08:00:25.000 America/New_York');

  q = date.add({ hour: 10.5 }); // truncated to 10
  expect(q.toString()).toEqual('Gregorian 2000-03-11 13:00:25.000 America/New_York');

  q = date.add({ hour: -24 });
  expect(q.toString()).toEqual('Gregorian 2000-03-10 03:00:25.000 America/New_York');

  q = date.add({ hour: 72 });
  expect(q.toString()).toEqual('Gregorian 2000-03-14 03:00:25.000 America/New_York');

  q = date.add({ hour: 96 });
  expect(q.toString()).toEqual('Gregorian 2000-03-15 03:00:25.000 America/New_York');

  q = date.add({ hour: 108 });
  expect(q.toString()).toEqual('Gregorian 2000-03-15 15:00:25.000 America/New_York');
});

test('minute', () => {
  const date: GregorianDate = gregorian(MAR_11_2000, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ minute: 60 });
  expect(q.toString()).toEqual('Gregorian 2000-03-11 04:00:25.000 America/New_York');

  q = date.add({ minute: 5.505 }); // truncated to 5
  expect(q.toString()).toEqual('Gregorian 2000-03-11 03:05:25.000 America/New_York');
});

test('milliseconds', () => {
  const date: GregorianDate = gregorian(MAR_11_2000, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ millis: 60 });
  expect(q.toString()).toEqual('Gregorian 2000-03-11 03:00:25.060 America/New_York');

  q = date.add({ millis: 120.5 }); // truncated to 120
  expect(q.toString()).toEqual('Gregorian 2000-03-11 03:00:25.120 America/New_York');

  // milliseconds roll over next day
  q = date.add({ millis: DAY * 2 + 120.5 }); // truncated
  expect(q.toString()).toEqual('Gregorian 2000-03-13 03:00:25.120 America/New_York');
});

test('milliseconds in day', () => {
  // May 17, 2026 10:00:00.000 AM
  let utc = gregorian(1779012000000, 'UTC');
  // May 17, 2026 06:00:00.000 AM
  let nyc = gregorian(1779012000000, NEW_YORK);

  expect(utc.modifiedJulianDay()).toEqual(2461178);
  expect(utc.millisecondsInDay()).toEqual(36000000); // 10 hours in ms
  expect(nyc.modifiedJulianDay()).toEqual(2461178);
  expect(nyc.millisecondsInDay()).toEqual(21600000); // 6 hours in ms

  // May 17, 2026 03:00:00.000 AM
  utc = gregorian(1778986800000, 'UTC');
  // May 16, 2026 11:00:00.000 PM
  nyc = gregorian(1778986800000, NEW_YORK);

  expect(utc.modifiedJulianDay()).toEqual(2461178);
  expect(utc.millisecondsInDay()).toEqual(10800000); // 3 hours in ms
  expect(nyc.modifiedJulianDay()).toEqual(2461177);
  expect(nyc.millisecondsInDay()).toEqual(82800000); // 23 hours in ms
});

test('years addition 1', () => {
  const base = 1778986800000;
  let date: GregorianDate;
  let q: GregorianDate;

  date = gregorian(base, 'UTC');
  expect(date.toString()).toEqual('Gregorian 2026-05-17 03:00:00.000 Etc/UTC');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2027-05-17 03:00:00.000 Etc/UTC');

  date = gregorian(base, NEW_YORK);
  expect(date.toString()).toEqual('Gregorian 2026-05-16 23:00:00.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2027-05-16 23:00:00.000 America/New_York');

  q = date.add({ year: 3 });
  expect(q.toString()).toEqual('Gregorian 2029-05-16 23:00:00.000 America/New_York');
});

test('years addition 2', () => {
  // May 17, 2026 10:00:00.000 AM
  let base = 1779012000000;
  let date: GregorianDate;
  let q: GregorianDate;

  date = gregorian(base, 'UTC');
  expect(date.toString()).toEqual('Gregorian 2026-05-17 10:00:00.000 Etc/UTC');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2027-05-17 10:00:00.000 Etc/UTC');

  date = gregorian(base, NEW_YORK);
  expect(date.toString()).toEqual('Gregorian 2026-05-17 06:00:00.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2027-05-17 06:00:00.000 America/New_York');

  // May 17, 2026 3:39:37.853 AM
  base = 1778989177853;

  date = gregorian(base, 'UTC');
  expect(date.toString()).toEqual('Gregorian 2026-05-17 03:39:37.853 Etc/UTC');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2027-05-17 03:39:37.853 Etc/UTC');

  q = date.add({ year: 2 });
  expect(q.toString()).toEqual('Gregorian 2028-05-17 03:39:37.853 Etc/UTC');

  q = date.add({ year: 3 });
  expect(q.toString()).toEqual('Gregorian 2029-05-17 03:39:37.853 Etc/UTC');

  date = gregorian(base, 'America/New_York');
  expect(date.toString()).toEqual('Gregorian 2026-05-16 23:39:37.853 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2027-05-16 23:39:37.853 America/New_York');

  q = date.add({ year: 2 });
  expect(q.toString()).toEqual('Gregorian 2028-05-16 23:39:37.853 America/New_York');

  q = date.add({ year: 3 });
  expect(q.toString()).toEqual('Gregorian 2029-05-16 23:39:37.853 America/New_York');
});

test('years addition 3', () => {
  // May 17, 2026 4:00:00 PM
  let base = 1779033600000;
  let date: GregorianDate;
  let q: GregorianDate;

  date = gregorian(base, 'UTC');
  expect(date.toString()).toEqual('Gregorian 2026-05-17 16:00:00.000 Etc/UTC');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2027-05-17 16:00:00.000 Etc/UTC');

  date = gregorian(base, TOKYO);
  expect(date.toString()).toEqual('Gregorian 2026-05-18 01:00:00.000 Asia/Tokyo');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2027-05-18 01:00:00.000 Asia/Tokyo');

  q = date.add({ year: 2 });
  expect(q.toString()).toEqual('Gregorian 2028-05-18 01:00:00.000 Asia/Tokyo');

  q = date.add({ year: 3 });
  expect(q.toString()).toEqual('Gregorian 2029-05-18 01:00:00.000 Asia/Tokyo');
});

import { BuddhistDate, GregorianDate, ISO8601Date, JapaneseDate, PersianDate } from '../../../src/systems/calendars';
import { DayOfWeek } from '../../../src/systems/calendars/fields';

const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

// Sat March 11, 2000 8:00:25 AM UTC
const BASE = 952761625000;

const DAY = 86400 * 1000;

const buddhist = (e: number, z: string) => BuddhistDate.fromUnixEpoch(e, z, 1, 1);
const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);
const iso8601 = (e: number, z: string) => ISO8601Date.fromUnixEpoch(e, z, 1, 1);
const japanese = (e: number, z: string) => JapaneseDate.fromUnixEpoch(e, z, 1, 1);
const persian = (e: number, z: string) => PersianDate.fromUnixEpoch(e, z, 1, 1);

test('fractional years', () => {
  const base = new Date(2004, 3, 11, 16, 34, 56); // Treat as UTC
  const utc = base.getTime() - base.getTimezoneOffset() * 60000;
  const date: GregorianDate = gregorian(utc, 'UTC');

  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2004-04-11 16:34:56.000 Etc/UTC');

  q = date.add({ year: 4.25 }); // + 4 years and 91.5 days (366 * .25)
  expect(q.toString()).toEqual('Gregorian 2008-07-12 04:34:56.000 Etc/UTC');

  q = date.add({ year: 4, month: 3 });
  expect(q.toString()).toEqual('Gregorian 2008-07-11 16:34:56.000 Etc/UTC');

  q = date.add({ year: -4.25 }); // - 4 years and 91.5 days (366 * .25)
  expect(q.toString()).toEqual('Gregorian 2000-01-11 04:34:56.000 Etc/UTC');

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
  const date: GregorianDate = gregorian(BASE, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Gregorian 2001-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1.5 });
  expect(q.toString()).toEqual('Gregorian 2001-09-09 16:00:25.000 America/New_York');

  q = date.add({ year: -3 });
  expect(q.toString()).toEqual('Gregorian 1997-03-11 03:00:25.000 America/New_York');

  // Earliest timezone offset for NY is LMT -4:56:2
  q = date.add({ year: -305 });
  expect(q.toString()).toEqual('Gregorian 1695-03-11 03:04:23.000 America/New_York');

  q = date.add({ year: -1000 });
  expect(q.toString()).toEqual('Gregorian 1000-03-11 03:04:23.000 America/New_York');

  q = date.add({ year: 1100 });
  expect(q.toString()).toEqual('Gregorian 3100-03-11 03:00:25.000 America/New_York');

  q = date.withZone(LOS_ANGELES);
  expect(q.toString()).toEqual('Gregorian 2000-03-11 00:00:25.000 America/Los_Angeles');
});

test('iso-8601 years', () => {
  const date: ISO8601Date = iso8601(BASE, NEW_YORK);
  let q: ISO8601Date;
  expect(date.toString()).toEqual('ISO8601 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('ISO8601 2001-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: -5 });
  expect(q.toString()).toEqual('ISO8601 1995-03-11 03:00:25.000 America/New_York');
});

test('japanese years', () => {
  const date: JapaneseDate = japanese(BASE, NEW_YORK);
  let q: JapaneseDate;
  expect(date.toString()).toEqual('Japanese 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Japanese 2001-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: -5 });
  expect(q.toString()).toEqual('Japanese 1995-03-11 03:00:25.000 America/New_York');
});

test('persian years', () => {
  const date: PersianDate = persian(BASE, NEW_YORK);
  let q: PersianDate;
  expect(date.toString()).toEqual('Persian 1378-12-21 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Persian 1379-12-21 03:00:25.000 America/New_York');

  q = date.add({ year: -5 });
  expect(q.toString()).toEqual('Persian 1373-12-21 03:00:25.000 America/New_York');
});

test('buddhist years', () => {
  const date: BuddhistDate = buddhist(BASE, NEW_YORK);
  let q: BuddhistDate;
  expect(date.toString()).toEqual('Buddhist 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: 1 });
  expect(q.toString()).toEqual('Buddhist 2001-03-11 03:00:25.000 America/New_York');

  q = date.add({ year: -5 });
  expect(q.toString()).toEqual('Buddhist 1995-03-11 03:00:25.000 America/New_York');
});

test('months', () => {
  const date: GregorianDate = gregorian(BASE, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ month: 1 });
  expect(q.toString()).toEqual('Gregorian 2000-04-11 04:00:25.000 America/New_York');

  q = date.add({ month: 1.5 });
  expect(q.toString()).toEqual('Gregorian 2000-04-26 04:00:25.000 America/New_York');

  q = date.add({ month: 7 });
  expect(q.toString()).toEqual('Gregorian 2000-10-11 04:00:25.000 America/New_York');

  q = date.add({ month: 9 });
  expect(q.toString()).toEqual('Gregorian 2000-12-11 03:00:25.000 America/New_York');

  q = date.add({ month: -17 });
  expect(q.toString()).toEqual('Gregorian 1998-10-11 04:00:25.000 America/New_York');

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
  expect(q.toString()).toEqual('Gregorian 2019-05-01 12:30:45.000 Etc/UTC');

  q = date.add({ month: 2 });
  expect(q.toString()).toEqual('Gregorian 2019-05-31 12:30:45.000 Etc/UTC');

  q = date.add({ month: 3 });
  expect(q.toString()).toEqual('Gregorian 2019-07-01 12:30:45.000 Etc/UTC');

  q = date.add({ month: 4 });
  expect(q.toString()).toEqual('Gregorian 2019-07-31 12:30:45.000 Etc/UTC');

  q = date.add({ month: 5 });
  expect(q.toString()).toEqual('Gregorian 2019-08-31 12:30:45.000 Etc/UTC');

  q = date.add({ month: 6 });
  expect(q.toString()).toEqual('Gregorian 2019-10-01 12:30:45.000 Etc/UTC');
});

test('persian months', () => {
  let date: PersianDate = persian(BASE, NEW_YORK);
  let q: PersianDate;
  expect(date.toString()).toEqual('Persian 1378-12-21 03:00:25.000 America/New_York');

  // Oddities show up with time and non-gregorian calendars, since the timezone
  // rules are based on the gregorian calendar. So adding 1 month below shifts
  // to the next persian year, but in gregorian calendar it crosses a daylight
  // savings boundary for America/New_York, so the hour changes.
  q = date.add({ month: 1 });
  expect(q.toString()).toEqual('Persian 1379-01-21 04:00:25.000 America/New_York');

  q = date.add({ month: 1.5 });
  expect(q.toString()).toEqual('Persian 1379-02-05 16:00:25.000 America/New_York');

  // Monday, March 21, 2022 12:34:54 PM UTC
  date = persian(1647880496000, NEW_YORK);
  expect(date.toString()).toEqual('Persian 1401-01-01 12:34:56.000 America/New_York');

  q = date.add({ month: 1 });
  expect(q.toString()).toEqual('Persian 1401-02-01 12:34:56.000 America/New_York');

  q = date.add({ month: 1.5 });
  expect(q.toString()).toEqual('Persian 1401-02-17 00:34:56.000 America/New_York');
});

test('days', () => {
  const date: GregorianDate = gregorian(BASE, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ day: 1 });
  expect(q.toString()).toEqual('Gregorian 2000-03-12 03:00:25.000 America/New_York');

  q = date.add({ day: 1.5 });
  expect(q.toString()).toEqual('Gregorian 2000-03-12 15:00:25.000 America/New_York');

  q = date.add({ day: 15 });
  expect(q.toString()).toEqual('Gregorian 2000-03-26 03:00:25.000 America/New_York');

  q = date.add({ day: -45 });
  expect(q.toString()).toEqual('Gregorian 2000-01-26 03:00:25.000 America/New_York');

  q = date.add({ day: 450 });
  expect(q.toString()).toEqual('Gregorian 2001-06-04 04:00:25.000 America/New_York');

  q = date.add({ day: -3650 });
  expect(q.toString()).toEqual('Gregorian 1990-03-14 03:00:25.000 America/New_York');

  // 35 days (5 weeks) + 5 days + 6 hours (.25 day) + 1 hour (timezone offset change)
  q = date.add({ day: 40.25 });
  expect(q.toString()).toEqual('Gregorian 2000-04-20 10:00:25.000 America/New_York');
});

test('weeks', () => {
  const date: GregorianDate = gregorian(BASE, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');
  expect(date.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);

  q = date.add({ week: 1 });
  expect(q.toString()).toEqual('Gregorian 2000-03-18 03:00:25.000 America/New_York');
  expect(q.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);

  q = date.add({ week: 1.5 }); // 10 days 12 hours
  expect(q.toString()).toEqual('Gregorian 2000-03-21 15:00:25.000 America/New_York');
  expect(q.dayOfWeek()).toEqual(DayOfWeek.TUESDAY);

  q = date.add({ week: 10 });
  expect(q.toString()).toEqual('Gregorian 2000-05-20 04:00:25.000 America/New_York');
  expect(q.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);

  q = date.add({ week: -52 });
  expect(q.toString()).toEqual('Gregorian 1999-03-13 03:00:25.000 America/New_York');
  expect(q.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);

  q = date.add({ week: 520 });
  expect(q.toString()).toEqual('Gregorian 2010-02-27 03:00:25.000 America/New_York');
  expect(q.dayOfWeek()).toEqual(DayOfWeek.SATURDAY);
});

test('with zone', () => {
  const date: GregorianDate = gregorian(BASE, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.withZone(LOS_ANGELES);
  expect(q.toString()).toEqual('Gregorian 2000-03-11 00:00:25.000 America/Los_Angeles');

  q = date.withZone(LONDON);
  expect(q.toString()).toEqual('Gregorian 2000-03-11 08:00:25.000 Europe/London');
});

test('hours', () => {
  const date: GregorianDate = gregorian(BASE, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ hour: 5 });
  expect(q.toString()).toEqual('Gregorian 2000-03-11 08:00:25.000 America/New_York');

  q = date.add({ hour: 10.5 });
  expect(q.toString()).toEqual('Gregorian 2000-03-11 13:30:25.000 America/New_York');

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
  const date: GregorianDate = gregorian(BASE, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ minute: 60 });
  expect(q.toString()).toEqual('Gregorian 2000-03-11 04:00:25.000 America/New_York');

  q = date.add({ minute: 5.505 });
  expect(q.toString()).toEqual('Gregorian 2000-03-11 03:05:55.300 America/New_York');
});

test('milliseconds', () => {
  const date: GregorianDate = gregorian(BASE, NEW_YORK);
  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2000-03-11 03:00:25.000 America/New_York');

  q = date.add({ millis: 60 });
  expect(q.toString()).toEqual('Gregorian 2000-03-11 03:00:25.060 America/New_York');

  q = date.add({ millis: 120.5 });
  expect(q.toString()).toEqual('Gregorian 2000-03-11 03:00:25.121 America/New_York');

  // milliseconds roll over next day
  q = date.add({ millis: DAY * 2.5 + 120.5 });
  expect(q.toString()).toEqual('Gregorian 2000-03-13 15:00:25.121 America/New_York');
});

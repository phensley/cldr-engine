import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { PersianDate } from '../../../src/systems/calendars/persian';

const make = (e: number, z: string) => PersianDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

const NEW_YORK = 'America/New_York';

// Wednesday, April 11, 2018 11:59:59.123 PM UTC
const APR_11 = 1523491199123;

// Monday, January 24, 620 4:40:00 AM UTC
const JAN_24 = -42599935200000;

test('persian calendar', () => {
  let d: PersianDate;

  d = make(APR_11, NEW_YORK);
  expect(d.toString()).toEqual('Persian 1397-01-22 19:59:59.123 America/New_York');
  expect(d.type()).toEqual('persian');
  expect(d.modifiedJulianDay()).toEqual(2458220);
  expect(d.era()).toEqual(0);
  expect(d.year()).toEqual(1397);
  expect(d.month()).toEqual(1); // Farvardin
  expect(d.dayOfMonth()).toEqual(22);
  expect(d.dayOfWeek()).toEqual(4);
  expect(d.weekOfYear()).toEqual(4);

  d = make(JAN_24, 'UTC');
  expect(d.modifiedJulianDay()).toEqual(1947533);
  expect(d.era()).toEqual(0);
  expect(d.year()).toEqual(-2);
  expect(d.month()).toEqual(11); // Bahman
  expect(d.dayOfMonth()).toEqual(3);
  expect(d.dayOfWeek()).toEqual(2);
  expect(d.weekOfYear()).toEqual(45);
});

test('persian leaps', () => {
  let d: PersianDate;

  // March 19, 2020
  d = make(1584633586000, 'UTC');
  expect(d.year()).toEqual(1398);
  expect(d.month()).toEqual(12); // Esfand
  expect(d.dayOfMonth()).toEqual(29); // 29 in non-leap
  expect(d.isLeapYear()).toEqual(false);

  // March 20, 2020
  d = make(1584719986000, 'UTC');
  expect(d.year()).toEqual(1399);
  expect(d.month()).toEqual(1); // Favardin
  expect(d.dayOfMonth()).toEqual(1);
  expect(d.isLeapYear()).toEqual(true);

  // March 20, 2021
  d = make(1616255986000, 'UTC');
  expect(d.month()).toEqual(12); // Esfand
  expect(d.dayOfMonth()).toEqual(30); // 30 in leap
  expect(d.isLeapYear()).toEqual(true);
});

test('with zone', () => {
  let d: PersianDate;

  d = make(APR_11, 'UTC');
  expect(d.toString()).toEqual('Persian 1397-01-22 23:59:59.123 Etc/UTC');

  d = d.withZone(NEW_YORK);
  expect(d.toString()).toEqual('Persian 1397-01-22 19:59:59.123 America/New_York');

  d = d.withZone('America/Los_Angeles');
  expect(d.toString()).toEqual('Persian 1397-01-22 16:59:59.123 America/Los_Angeles');
});

test('subtract', () => {
  let end: PersianDate;

  const start = make(APR_11, 'UTC');
  expect(start.toString()).toEqual('Persian 1397-01-22 23:59:59.123 Etc/UTC');

  end = start.subtract({ year: 1, month: 1, day: 1 });
  expect(end.toString()).toEqual('Persian 1395-12-21 23:59:59.123 Etc/UTC');

  end = start.subtract({ year: -1, month: -1, day: -1 });
  expect(end.toString()).toEqual('Persian 1398-02-23 23:59:59.123 Etc/UTC');
});

import { BuddhistDate } from '../../../src';
import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { LOS_ANGELES, NEW_YORK, UTC } from './_referencedates';

const make = (e: number, z: string) => BuddhistDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

// Wednesday, April 11, 2018 11:59:59.123 PM UTC
const APR_11_2018 = 1523491199123;

// Year of Buddha's birth
const BUDDHA = -79293887631000;

test('buddhist calendar', () => {
  let d: BuddhistDate;

  d = make(APR_11_2018, NEW_YORK);
  expect(d.toString()).toEqual('Buddhist 2018-04-11 19:59:59.123 America/New_York');
  expect(d.type()).toEqual('buddhist');
  expect(d.modifiedJulianDay()).toEqual(2458220);
  expect(d.era()).toEqual(0);
  expect(d.year()).toEqual(2561);
  expect(d.month()).toEqual(4); // April
  expect(d.dayOfMonth()).toEqual(11);

  d = make(BUDDHA, NEW_YORK);
  expect(d.type()).toEqual('buddhist');
  expect(d.modifiedJulianDay()).toEqual(1522834);
  expect(d.era()).toEqual(0);
  expect(d.year()).toEqual(0);
  expect(d.month()).toEqual(4); // April
  expect(d.dayOfMonth()).toEqual(17);
});

test('with zone', () => {
  let d: BuddhistDate;

  d = make(APR_11_2018, UTC);
  expect(d.toString()).toEqual('Buddhist 2018-04-11 23:59:59.123 Etc/UTC');

  d = d.withZone(LOS_ANGELES);
  expect(d.toString()).toEqual('Buddhist 2018-04-11 16:59:59.123 America/Los_Angeles');

  d = d.withZone(NEW_YORK);
  expect(d.toString()).toEqual('Buddhist 2018-04-11 19:59:59.123 America/New_York');
});

import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { BuddhistDate } from '../../../src/systems/calendars';

const make = (e: number, z: string) => BuddhistDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

const NEW_YORK = 'America/New_York';

test('buddhist calendar', () => {
  let d: BuddhistDate;
  let n: number;

  // Wednesday, April 11, 2018 11:59:59.123 PM UTC
  n = 1523491199123;

  d = make(n, NEW_YORK);
  expect(d.toString()).toEqual('BuddhistDate(epoch=1523491199123, zone=America/New_York)');
  expect(d.type()).toEqual('buddhist');
  expect(d.modifiedJulianDay()).toEqual(2458220);
  expect(d.era()).toEqual(0);
  expect(d.year()).toEqual(2561);
  expect(d.month()).toEqual(4); // April
  expect(d.dayOfMonth()).toEqual(11);

  // Year of Buddha's birth
  n = -79293887631000;
  d = make(n, NEW_YORK);
  expect(d.type()).toEqual('buddhist');
  expect(d.modifiedJulianDay()).toEqual(1522834);
  expect(d.era()).toEqual(0);
  expect(d.year()).toEqual(0);
  expect(d.month()).toEqual(4); // April
  expect(d.dayOfMonth()).toEqual(17);
});

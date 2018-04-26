import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { PersianDate } from '../../../src/systems/calendars/persian';

const make = (e: number, z: string) => PersianDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

const NEW_YORK = 'America/New_York';
const PARIS = 'Europe/Paris';

test('persian calendar', () => {
  let d: PersianDate;
  let n: number;

  // Wednesday, April 11, 2018 11:59:59.123 PM UTC
  n = 1523491199123;

  d = make(n, NEW_YORK);
  expect(d.toString()).toEqual('PersianDate(epoch=1523491199123, zone=America/New_York)');
  expect(d.type()).toEqual('persian');
  expect(d.modifiedJulianDay()).toEqual(2458220);
  expect(d.era()).toEqual(0);
  expect(d.year()).toEqual(1397);
  expect(d.month()).toEqual(1); // Farvardin
  expect(d.dayOfMonth()).toEqual(22);
  expect(d.dayOfWeek()).toEqual(4);
  expect(d.weekOfYear()).toEqual(4);

  // Monday, January 24, 620 4:40:00 AM UTC
  n = -42599935200000;

  d = make(n, 'UTC');
  expect(d.modifiedJulianDay()).toEqual(1947533);
  expect(d.era()).toEqual(0);
  expect(d.year()).toEqual(-2);
  expect(d.month()).toEqual(11); // Bahman
  expect(d.dayOfMonth()).toEqual(3);
  expect(d.dayOfWeek()).toEqual(2);
  expect(d.weekOfYear()).toEqual(45);
});

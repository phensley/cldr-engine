import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { GregorianDate } from '../../../src/systems/calendars/gregorian';
import { Constants } from '../../../src/systems/calendars/constants';

const make = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

const NEW_YORK = 'America/New_York';
const PARIS = 'Europe/Paris';

test('gregorian date', () => {
  let d: GregorianDate;
  let n: number;

  // Wednesday, April 11, 2018 11:59:59.123 PM UTC
  n = 1523491199123;

  // 7:59 PM NY time
  d = make(n, NEW_YORK);
  expect(d.julianDay()).toEqual(2458220);
  expect(d.era()).toEqual(1);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(3);
  expect(d.dayOfMonth()).toEqual(11);
  expect(d.dayOfYear()).toEqual(101);
  expect(d.weekOfYear()).toEqual(15);
  expect(d.yearOfWeekOfYear()).toEqual(2018);

  expect(d.hour()).toEqual(7);
  expect(d.hourOfDay()).toEqual(19);
  expect(d.minute()).toEqual(59);
  expect(d.second()).toEqual(59);
  expect(d.milliseconds()).toEqual(123);

  // + 1 second
  d = make(n + 1000, NEW_YORK);

  expect(d.julianDay()).toEqual(2458220);
  expect(d.era()).toEqual(1);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(3);
  expect(d.dayOfMonth()).toEqual(11);
  expect(d.dayOfYear()).toEqual(101);
  expect(d.weekOfYear()).toEqual(15);
  expect(d.yearOfWeekOfYear()).toEqual(2018);

  expect(d.hour()).toEqual(8);
  expect(d.hourOfDay()).toEqual(20);
  expect(d.minute()).toEqual(0);
  expect(d.second()).toEqual(0);
  expect(d.milliseconds()).toEqual(123);

  // 1:59 AM Paris time
  d = make(n, PARIS);

  expect(d.julianDay()).toEqual(2458221);
  expect(d.era()).toEqual(1);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(3);
  expect(d.dayOfMonth()).toEqual(12);
  expect(d.dayOfYear()).toEqual(102);

  expect(d.hour()).toEqual(1);
  expect(d.hourOfDay()).toEqual(1);
  expect(d.minute()).toEqual(59);
  expect(d.second()).toEqual(59);
  expect(d.milliseconds()).toEqual(123);

  // Monday, October 15, 2018 11:59:59 PM UTC
  n = 1539647999000;

  d = make(n, NEW_YORK);

  expect(d.julianDay()).toEqual(2458407);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(9);
  expect(d.dayOfMonth()).toEqual(15);
  expect(d.dayOfYear()).toEqual(288);
  expect(d.weekOfYear()).toEqual(42);
  expect(d.yearOfWeekOfYear()).toEqual(2018);
});

test('min / max date', () => {
  let d: GregorianDate;
  let n: number;

  const unix = Constants.JD_UNIX_EPOCH;

  n = (unix - 1) * Constants.ONE_DAY_MS;
  d = make(-n, NEW_YORK);
  expect(d.era()).toEqual(0);
  expect(d.extendedYear()).toEqual(-4712);
  expect(d.year()).toEqual(4713);
  expect(d.month()).toEqual(0); // Jan
  expect(d.dayOfMonth()).toEqual(1);

  // Attempting to represent Dec 31 4714 BC
  expect(() => make(-n - Constants.ONE_DAY_MS, NEW_YORK)).toThrowError();

  n = (Constants.JD_MAX - unix + 1) * Constants.ONE_DAY_MS;
  d = make(n, NEW_YORK);
  expect(d.era()).toEqual(1);
  expect(d.extendedYear()).toEqual(8652);
  expect(d.year()).toEqual(8652);
  expect(d.month()).toEqual(11); // Dec
  expect(d.dayOfMonth()).toEqual(31);

  // Attempt to represent Jan  1 8653 AD
  expect(() => make(n + Constants.ONE_DAY_MS, NEW_YORK)).toThrowError();
});

import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { JapaneseDate } from '../../../src/systems/calendars/japanese';

const make = (e: number, z: string) => JapaneseDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

const NEW_YORK = 'America/New_York';
const PARIS = 'Europe/Paris';

test('persian calendar', () => {
  let d: JapaneseDate;
  let n: number;

  // Monday, January 24, 620 4:40:00 AM UTC
  n = -42599935200000;
  d = make(n, 'UTC');
  expect(d.era()).toEqual(0); // Taika 645-06-19
  expect(d.year()).toEqual(-24);
  expect(d.extendedYear()).toEqual(620);

  // Monday, June 1, 1925 12:34:56 PM UTC
  n = -1406978704000;
  d = make(n, 'UTC');
  expect(d.era()).toEqual(233); // Taisho 1912-07-30
  expect(d.year()).toEqual(14);
  expect(d.extendedYear()).toEqual(1925);

  // Thursday, June 1, 1933 12:34:56 PM UTC
  n = -1154517904000;
  d = make(n, 'UTC');
  expect(d.era()).toEqual(234); // Showa 1926-12-25
  expect(d.year()).toEqual(8);
  expect(d.extendedYear()).toEqual(1933);

  // Sunday, October 5, 1975 12:34:56 PM UTC
  n = 181744496000;
  d = make(n, 'UTC');
  expect(d.era()).toEqual(234); // Showa 1926-12-25
  expect(d.year()).toEqual(50);
  expect(d.extendedYear()).toEqual(1975);

  // Monday, January 9, 1989 12:34:56 PM UTC
  n = 600352496000;
  d = make(n, 'UTC');
  expect(d.era()).toEqual(235); // Heisei 1989-01-08
  expect(d.year()).toEqual(1);
  expect(d.extendedYear()).toEqual(1989);

  // Wednesday, April 11, 2018 11:59:59.123 PM UTC
  n = 1523491199123;

  d = make(n, 'UTC');
  expect(d.era()).toEqual(235); // Heisei 1989-01-08
  expect(d.year()).toEqual(30);
  expect(d.extendedYear()).toEqual(2018);
});

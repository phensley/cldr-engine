import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { JapaneseDate } from '../../../src/systems/calendars/japanese';

const make = (e: number, z: string) => JapaneseDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

// Monday, June 1, 1925 12:34:56 PM UTC
const JUN_01_1925 = -1406978704000;

test('japanese calendar', () => {
  let d: JapaneseDate;
  let n: number;

  // Monday, January 24, 620 4:40:00 AM UTC
  n = -42599935200000;
  d = make(n, 'UTC');
  expect(d.toString()).toEqual('Japanese 0620-01-21 04:40:00.000 Etc/UTC');
  expect(d.type()).toEqual('japanese');
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

  // Saturday, June 1, 2019 05:00:00.000 PM UTC
  n = 1559365200000;
  d = make(n, 'UTC');
  expect(d.era()).toEqual(236);
  expect(d.year()).toEqual(1);
  expect(d.extendedYear()).toEqual(2019);
});

test('japanese era year', () => {
  let d: JapaneseDate;
  let n: number;

  // Monday, June 5, 2023 12:34:56 PM UTC
  n = 1685968496000;
  d = make(n, 'UTC');
  expect(d.era()).toEqual(236);
  expect(d.year()).toEqual(5);
  expect(d.extendedYear()).toEqual(2023);
});

test('with zone', () => {
  let d: JapaneseDate;

  d = make(JUN_01_1925, 'UTC');
  expect(d.toString()).toEqual('Japanese 1925-06-01 12:34:56.000 Etc/UTC');

  d = d.withZone('America/New_York');
  expect(d.toString()).toEqual('Japanese 1925-06-01 08:34:56.000 America/New_York');

  d = d.withZone('America/Los_Angeles');
  expect(d.toString()).toEqual('Japanese 1925-06-01 04:34:56.000 America/Los_Angeles');
});

test('einin era boundary (regression: 1293-08-55 typo)', () => {
  // The era table lists Einin as starting 1293-08-05 (was 1293-08-55, an
  // impossible day). Pre-1582 dates internalize via the proleptic Julian
  // calendar (as in ICU), so the Einin boundary falls at Julian 1293-08-05 =
  // Gregorian 1293-08-12. Values verified against ICU4J (era 140/141).

  // 1293-08-04 → Shoo (started 1288-04-28), era-year 6
  let d = make(-21345379200000, 'UTC');
  expect(d.era()).toEqual(140);
  expect(d.year()).toEqual(6);
  expect(d.extendedYear()).toEqual(1293);

  // 1293-08-11 → last day of Shoo
  d = make(-21344774400000, 'UTC');
  expect(d.era()).toEqual(140);
  expect(d.year()).toEqual(6);

  // 1293-08-12 → first day of Einin. With the 1293-08-55 typo (August has 31
  // days) every date in August 1293 resolved to Shoo instead.
  d = make(-21344688000000, 'UTC');
  expect(d.era()).toEqual(141);
  expect(d.year()).toEqual(1);
  expect(d.extendedYear()).toEqual(1293);

  // 1294-01-09 → Einin era-year 2
  d = make(-21331728000000, 'UTC');
  expect(d.era()).toEqual(141);
  expect(d.year()).toEqual(2);
});

import { RNG } from '../../../../cldr-utils/__tests__/rng';
import { BuddhistDate, GregorianDate, PersianDate } from '../../../src/systems/calendars';

// Fri Apr 3 2020 18:08:52.123 UTC
const EPOCH = 1585937332123;
const YEAR_3K = 32511703053000;

const ZONES = [
  'America/New_York',
  'Asia/Tokyo',
  'Africa/Casablanca',
  'Antarctica/McMurdo' // alias
];

test('gregorian fields', () => {
  const d = GregorianDate.fromUnixEpoch(EPOCH, 'America/New_York', 1, 1);
  expect(d.toString()).toEqual('Gregorian 2020-04-03 14:08:52.123 America/New_York');
  expect(d.fields()).toEqual({
    year: 2020,
    month: 4,
    day: 3,
    hour: 14,
    minute: 8,
    second: 52,
    millis: 123,
    zoneId: 'America/New_York'
  });
});

test('gregorian set field', () => {
  let d: GregorianDate;

  d = GregorianDate.fromUnixEpoch(EPOCH, 'America/New_York', 1, 1);
  expect(d.set({ year: 1997, day: 20 }).toString()).toEqual('Gregorian 1997-04-20 14:08:52.123 America/New_York');
  expect(d.set({ year: 1997, day: 20 }).toString()).toEqual('Gregorian 1997-04-20 14:08:52.123 America/New_York');

  // Moving month backwards into DST
  expect(d.set({ month: 2 }).toString()).toEqual('Gregorian 2020-02-03 14:08:52.123 America/New_York');
  expect(d.set({ month: 0 }).toString()).toEqual('Gregorian 2020-01-03 14:08:52.123 America/New_York');

  // Clamp invalid month to 1 <= m <= 12
  expect(d.set({ month: -5 }).toString()).toEqual('Gregorian 2020-01-03 14:08:52.123 America/New_York');
  expect(d.set({ month: 24 }).toString()).toEqual('Gregorian 2020-12-03 14:08:52.123 America/New_York');

  // Clamp invalid day to 1 <= day <= (days in month)
  expect(d.set({ day: -60 }).toString()).toEqual('Gregorian 2020-04-01 14:08:52.123 America/New_York');
  expect(d.set({ day: 60 }).toString()).toEqual('Gregorian 2020-04-30 14:08:52.123 America/New_York');

  // Clamp hour, minute, second, millis to 0 <= n <= 60
  expect(d.set({ hour: 10 }).toString()).toEqual('Gregorian 2020-04-03 10:08:52.123 America/New_York');
  expect(d.set({ hour: -10 }).toString()).toEqual('Gregorian 2020-04-03 00:08:52.123 America/New_York');
  expect(d.set({ hour: 0 }).toString()).toEqual('Gregorian 2020-04-03 00:08:52.123 America/New_York');

  // Gregorian cutover
  expect(d.set({ year: 1582, month: 10, day: 3 }).toString())
    .toEqual('Gregorian 1582-10-03 14:08:52.123 America/New_York');
  expect(d.set({ year: 1582, month: 10, day: 16 }).toString())
    .toEqual('Gregorian 1582-10-16 14:08:52.123 America/New_York');

  // Set zone concurrently
  expect(d.set({ zoneId: 'America/Los_Angeles' }).toString())
    .toEqual('Gregorian 2020-04-03 14:08:52.123 America/Los_Angeles');

  // Set fields then change zone
  expect(d.set({}).withZone('America/Los_Angeles').toString())
    .toEqual('Gregorian 2020-04-03 11:08:52.123 America/Los_Angeles');

  // Set fields, then change zone
  expect(d.set({ hour: 9 }).withZone('America/Los_Angeles').toString())
    .toEqual('Gregorian 2020-04-03 06:08:52.123 America/Los_Angeles');

  // Change zone, then set fields
  expect(d.withZone('America/Los_Angeles').set({ hour: 9 }).toString())
    .toEqual('Gregorian 2020-04-03 09:08:52.123 America/Los_Angeles');

  // Set to invalid zone
  expect(d.set({ zoneId: 'ZZZ' }).toString())
    .toEqual('Gregorian 2020-04-03 14:08:52.123 Etc/UTC');
});

test('buddhist fields', () => {
  const d = BuddhistDate.fromUnixEpoch(EPOCH, 'America/New_York', 1, 1);

  // The toString method formats the extended year
  expect(d.toString()).toEqual('Buddhist 2020-04-03 14:08:52.123 America/New_York');
  expect(d.fields()).toEqual({
    year: 2020,
    month: 4,
    day: 3,
    hour: 14,
    minute: 8,
    second: 52,
    millis: 123,
    zoneId: 'America/New_York'
  });
});

test('buddhist set field', () => {
  let d: BuddhistDate;

  d = BuddhistDate.fromUnixEpoch(EPOCH, 'America/New_York', 1, 1);
  expect(d.set({ year: 1997, day: 20 }).toString()).toEqual('Buddhist 1997-04-20 14:08:52.123 America/New_York');
});

test('persian fields', () => {
  const d = PersianDate.fromUnixEpoch(EPOCH, 'America/New_York', 1, 1);
  expect(d.toString()).toEqual('Persian 1399-01-15 14:08:52.123 America/New_York');
  expect(d.fields()).toEqual({
    year: 1399,
    month: 1,
    day: 15,
    hour: 14,
    minute: 8,
    second: 52,
    millis: 123,
    zoneId: 'America/New_York'
  });
});

test('persian set field', () => {
  let d: PersianDate;

  d = PersianDate.fromUnixEpoch(EPOCH, 'America/New_York', 1, 1);
  expect(d.set({ year: 1997, day: 20 }).toString()).toEqual('Persian 1997-01-20 13:08:52.123 America/New_York');

  // Clamp invalid month to 1 <= m <= 12
  expect(d.set({ month: -5 }).toString()).toEqual('Persian 1399-01-15 14:08:52.123 America/New_York');
  expect(d.set({ month: 24 }).toString()).toEqual('Persian 1399-12-15 13:08:52.123 America/New_York');

  // Clamp invalid day to 1 <= day <= (days in month)
  expect(d.set({ day: -60 }).toString()).toEqual('Persian 1399-01-01 14:08:52.123 America/New_York');
  expect(d.set({ day: 60 }).toString()).toEqual('Persian 1399-01-31 14:08:52.123 America/New_York');

  // Time calculation is shared with Gregorian so this is sufficient
  expect(d.set({ hour: 5 }).toString()).toEqual('Persian 1399-01-15 05:08:52.123 America/New_York');

  // Just change zone
  expect(d.set({}).withZone('America/Los_Angeles').toString())
    .toEqual('Persian 1399-01-15 11:08:52.123 America/Los_Angeles');

  // Set fields, then change zone
  expect(d.set({ hour: 9 }).withZone('America/Los_Angeles').toString())
    .toEqual('Persian 1399-01-15 06:08:52.123 America/Los_Angeles');

  // Change zone, then set fields
  expect(d.withZone('America/Los_Angeles').set({ hour: 9 }).toString())
    .toEqual('Persian 1399-01-15 09:08:52.123 America/Los_Angeles');
});

test('gregorian random', () => {
  // Randomized epochs to ensure setting all fields round-trips
  const rng = new RNG('1309');
  for (let i = 0; i < 10000; i++) {
    for (const sgn of [1, -1]) {
      const n = Math.floor(sgn * rng.rand() * YEAR_3K);
      for (const z of ZONES) {
        const d = GregorianDate.fromUnixEpoch(n, z, 1, 1);
        const r = d.set(d.fields());
        expect(d.compare(r)).toEqual(0);
      }
    }
  }
});

test('persian random', () => {
  // Randomized epochs to ensure setting all fields round-trips
  const rng = new RNG('1309');
  for (let i = 0; i < 10000; i++) {
    for (const sgn of [1, -1]) {
      const n = Math.floor(sgn * rng.rand() * YEAR_3K);
      for (const z of ZONES) {
        const d = PersianDate.fromUnixEpoch(n, z, 1, 1);
        const r = d.set(d.fields());
        expect(d.compare(r)).toEqual(0);
      }
    }
  }
});

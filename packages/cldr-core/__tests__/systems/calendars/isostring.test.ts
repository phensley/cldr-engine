import { BuddhistDate, GregorianDate, PersianDate } from '../../../src/systems/calendars';

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);
const persian = (e: number, z: string) => PersianDate.fromUnixEpoch(e, z, 1, 1);
const buddhist = (e: number, z: string) => BuddhistDate.fromUnixEpoch(e, z, 1, 1);

test('gregorian iso string', () => {
  let d: GregorianDate;

  d = gregorian(1586089698456, 'America/New_York');
  expect(d.toISOString()).toEqual('2020-04-05T12:28:18.456Z');
  expect(d.toLocalISOString()).toEqual('2020-04-05T08:28:18.456-04:00');

  d = gregorian(1586089698456, 'Asia/Tokyo');
  expect(d.toISOString()).toEqual('2020-04-05T12:28:18.456Z');
  expect(d.toLocalISOString()).toEqual('2020-04-05T21:28:18.456+09:00');

  d = gregorian(-62198755200000, 'Etc/UTC');
  expect(d.toISOString()).toEqual('-0001-01-03T00:00:00.000Z');
  expect(d.toLocalISOString()).toEqual('-0001-01-03T00:00:00.000+00:00');

  d = gregorian(-62198755200000, 'America/New_York');
  expect(d.toISOString()).toEqual('-0001-01-03T00:00:00.000Z');
  expect(d.toLocalISOString()).toEqual('-0001-01-02T19:03:58.000-04:56');
});

test('persian iso string', () => {
  let d: PersianDate;

  d = persian(1586089698456, 'America/New_York');
  expect(d.toISOString()).toEqual('2020-04-05T12:28:18.456Z');
  expect(d.toLocalISOString()).toEqual('2020-04-05T08:28:18.456-04:00');

  d = persian(1586089698456, 'Asia/Tokyo');
  expect(d.toISOString()).toEqual('2020-04-05T12:28:18.456Z');
  expect(d.toLocalISOString()).toEqual('2020-04-05T21:28:18.456+09:00');
});

test('buddhist iso string', () => {
  let d: BuddhistDate;

  d = buddhist(1586089698456, 'America/New_York');
  expect(d.toISOString()).toEqual('2020-04-05T12:28:18.456Z');
  expect(d.toLocalISOString()).toEqual('2020-04-05T08:28:18.456-04:00');

  d = buddhist(1586089698456, 'Asia/Tokyo');
  expect(d.toISOString()).toEqual('2020-04-05T12:28:18.456Z');
  expect(d.toLocalISOString()).toEqual('2020-04-05T21:28:18.456+09:00');
});

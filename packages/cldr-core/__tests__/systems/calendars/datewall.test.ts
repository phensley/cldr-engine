import { GregorianDate } from '../../../src';
import { NEW_YORK } from './_referencedates';

const ONE_HOUR_SECS = 3600;
const ONE_HOUR_MS = ONE_HOUR_SECS * 1000;

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

test('calendar add spring dst', () => {
  let q: GregorianDate;

  // Crossing NY Spring DST boundary by adding time moves offset from -5 to -4

  // March 9 2025 1:59:00 AM Eastern, 1 minute before the spring DST boundary.
  const epoch0 = 1741503540000;
  const t = gregorian(epoch0, NEW_YORK);
  expect(t.toString()).toEqual('Gregorian 2025-03-09 01:59:00.000 America/New_York');
  expect(t.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);

  // Wall clock adjustment: NO
  q = t.add({ hour: 24 });
  expect(q.toString()).toEqual('Gregorian 2025-03-10 02:59:00.000 America/New_York');
  // Time moved forward 24 hours
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(24);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);

  // Wall clock adjustment: YES
  q = t.add({ day: 1 });
  // Time moved forward 23 hours
  expect(q.toString()).toEqual('Gregorian 2025-03-10 01:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(23);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);

  // // Wall clock adjustment: NO (disabled)
  // q = t.add({ day: 1 }, { noWallClock: true });
  // // Time moved forward 24 hours because wall clock adjustment disabled
  // expect(q.toString()).toEqual('Gregorian 2025-03-10 02:59:00.000 America/New_York');
  // expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(24);
  // expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);

  // Wall clock adjustment: YES
  q = t.add({ month: 1 });
  // Time moved forward 30 days, 23 hours
  expect(q.toString()).toEqual('Gregorian 2025-04-09 01:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS)
    // 743 hours = 30 days, 23 hours
    .toEqual(743);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);
});

test('calendar add fall dst', () => {
  let q: GregorianDate;

  // Crossing NY Fall DST boundary by adding time moves offset from -4 to -5

  // November 2 2025 1:59:00 AM Eastern, 1 minute before the fall DST boundary.
  const epoch0 = 1762063140000;
  const t = gregorian(epoch0, NEW_YORK);
  expect(t.toString()).toEqual('Gregorian 2025-11-02 01:59:00.000 America/New_York');
  expect(t.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);

  // Wall clock adjustment: NO
  q = t.add({ hour: 24 });
  // Time moved backward 24 hours
  expect(q.toString()).toEqual('Gregorian 2025-11-03 00:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(24);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);

  // Wall clock adjustment: YES
  q = t.add({ day: 1 });
  // Time moved backward 25 hours
  expect(q.toString()).toEqual('Gregorian 2025-11-03 01:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(25);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);

  // // Wall clock adjustment: NO (disabled)
  // q = t.add({ day: 1 }, { noWallClock: true });
  // // Time moved backward 24 hours because wall clock adjustment is disabled.
  // expect(q.toString()).toEqual('Gregorian 2025-11-03 00:59:00.000 America/New_York');
  // expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(24);
  // expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);

  // Wall clock adjustment: YES
  q = t.add({ month: 1 });
  // Time moved backward 30 days, 1 hour
  expect(q.toString()).toEqual('Gregorian 2025-12-02 01:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS)
    // 721 hours = 30 days, 1 hour
    .toEqual(721);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);
});

test('calendar subtract spring dst', () => {
  let q: GregorianDate;

  // Crossing NY Spring DST boundary by subtracting time moves offset from -4 to -5

  // March 10, 2025 1:59:00 AM Eastern, after fall DST boundary.
  const epoch0 = 1741586340000;
  const t = gregorian(epoch0, NEW_YORK);
  expect(t.toString()).toEqual('Gregorian 2025-03-10 01:59:00.000 America/New_York');
  expect(t.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);

  // Wall clock adjustment: NO
  q = t.subtract({ hour: 24 });
  // Time moved backward 24 hours
  expect(q.toString()).toEqual('Gregorian 2025-03-09 00:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(-24);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);

  // Wall clock adjustment: YES
  q = t.subtract({ day: 1 });
  // Time moved backward 23 hours.
  expect(q.toString()).toEqual('Gregorian 2025-03-09 01:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(-23);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);

  // // Wall clock adjustment: NO (disabled)
  // q = t.subtract({ day: 1 }, { noWallClock: true });
  // // Time moved backward 24 hours because wall clock adjustment is disabled.
  // expect(q.toString()).toEqual('Gregorian 2025-03-09 00:59:00.000 America/New_York');
  // expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(-24);
  // expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);

  // Wall clock adjustment: YES
  q = t.subtract({ month: 1 });
  // Time moved backward 28 days, 23 hours
  expect(q.toString()).toEqual('Gregorian 2025-02-10 01:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS)
    // 671 hours = 28 days, 23 hours
    .toEqual(-671);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);
});

test('calendar subtract fall dst', () => {
  let q: GregorianDate;

  // Crossing NY Fall DST boundary by subtracting time moves offset from -5 to -4

  // November 3 2025 00:59:00 AM Eastern, 23 hours after fall DST boundary.
  const epoch0 = 1762149540000;
  const t = gregorian(epoch0, NEW_YORK);
  expect(t.toString()).toEqual('Gregorian 2025-11-03 00:59:00.000 America/New_York');
  expect(t.timeZoneOffset() / ONE_HOUR_MS).toEqual(-5);

  // Wall clock adjustment: NO
  q = t.subtract({ hour: 24 });
  // Time moved backward 24 hours
  expect(q.toString()).toEqual('Gregorian 2025-11-02 01:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(-24);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);

  // Wall clock adjustment: YES
  q = t.subtract({ day: 1 });
  // Time moved backward 25 hours.
  expect(q.toString()).toEqual('Gregorian 2025-11-02 00:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(-25);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);

  // // Wall clock adjustment: NO (disabled)
  // q = t.subtract({ day: 1 }, { noWallClock: true });
  // // Time moved backward 24 hours because wall clock adjustment is disabled.
  // expect(q.toString()).toEqual('Gregorian 2025-11-02 01:59:00.000 America/New_York');
  // expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS).toEqual(-24);
  // expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);

  // Wall clock adjustment: YES
  q = t.subtract({ month: 1 });
  // Time moved backward 30 days, 25 hours
  expect(q.toString()).toEqual('Gregorian 2025-10-03 00:59:00.000 America/New_York');
  expect((q.unixEpoch() - t.unixEpoch()) / ONE_HOUR_MS)
    // 745 hours = 30 days, 25 hours
    .toEqual(-745);
  expect(q.timeZoneOffset() / ONE_HOUR_MS).toEqual(-4);
});

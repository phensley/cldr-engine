import { GregorianDate } from '@phensley/cldr-core';

const FEB_15_2025_123040_UTC = 1739622640000;

test('startOf date', () => {
  let d = GregorianDate.fromUnixEpoch(FEB_15_2025_123040_UTC, 'America/New_York');

  expect(d.toString()).toEqual('Gregorian 2025-02-15 07:30:40.000 America/New_York');
  expect(d.startOf('year').toString()).toEqual('Gregorian 2025-01-01 00:00:00.000 America/New_York');
  expect(d.startOf('month').toString()).toEqual('Gregorian 2025-02-01 00:00:00.000 America/New_York');
  expect(d.startOf('day').toString()).toEqual('Gregorian 2025-02-15 00:00:00.000 America/New_York');
  expect(d.startOf('hour').toString()).toEqual('Gregorian 2025-02-15 07:00:00.000 America/New_York');
  expect(d.startOf('minute').toString()).toEqual('Gregorian 2025-02-15 07:30:00.000 America/New_York');
  expect(d.startOf('second').toString()).toEqual('Gregorian 2025-02-15 07:30:40.000 America/New_York');
});

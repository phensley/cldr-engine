import { GregorianDate } from '@phensley/cldr-core';

const FEB_15_2025_123040_UTC = 1739622640000;

test('endOf date', () => {
  let d = GregorianDate.fromUnixEpoch(FEB_15_2025_123040_UTC, 'America/New_York');

  expect(d.toString()).toEqual('Gregorian 2025-02-15 07:30:40.000 America/New_York');
  expect(d.endOf('year').toString()).toEqual('Gregorian 2025-12-31 23:59:59.999 America/New_York');
  expect(d.endOf('month').toString()).toEqual('Gregorian 2025-02-28 23:59:59.999 America/New_York');
  expect(d.endOf('day').toString()).toEqual('Gregorian 2025-02-15 23:59:59.999 America/New_York');
  expect(d.endOf('hour').toString()).toEqual('Gregorian 2025-02-15 07:59:59.999 America/New_York');
  expect(d.endOf('minute').toString()).toEqual('Gregorian 2025-02-15 07:30:59.999 America/New_York');
  expect(d.endOf('second').toString()).toEqual('Gregorian 2025-02-15 07:30:40.999 America/New_York');
});

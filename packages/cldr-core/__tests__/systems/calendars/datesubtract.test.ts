import { GregorianDate } from '../../../src';

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

test('fractional years', () => {
  const base = new Date(2004, 3, 11, 16, 34, 56); // Treat as UTC
  const utc = base.getTime() - base.getTimezoneOffset() * 60000;
  const date: GregorianDate = gregorian(utc, 'UTC');

  let q: GregorianDate;
  expect(date.toString()).toEqual('Gregorian 2004-04-11 16:34:56.000 Etc/UTC');

  q = date.add({ year: -4.25 }); // - 4 years and 91.5 days (366 * .25)
  expect(q.toString()).toEqual('Gregorian 2000-01-11 04:34:56.000 Etc/UTC');

  q = date.add({ year: -4, month: -3 });
  expect(q.toString()).toEqual('Gregorian 2000-01-11 16:34:56.000 Etc/UTC');

  q = date.subtract({ year: 4.25 }); // - 4 years and 91.5 days (366 * .25)
  expect(q.toString()).toEqual('Gregorian 2000-01-11 04:34:56.000 Etc/UTC');

  q = date.subtract({ year: 4, month: 3 });
  expect(q.toString()).toEqual('Gregorian 2000-01-11 16:34:56.000 Etc/UTC');
});

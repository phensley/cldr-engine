import { CalendarDate, GregorianDate } from '../../../src/systems';

const UTC = 'Etc/UTC';

// Sat March 11, 2000 8:00:25 AM UTC
const BASE = 952761625000;

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

test('basic difference', () => {
  let r: number;
  let end: CalendarDate;
  const start = gregorian(BASE, UTC);

  end = start.add({ day: 183 });
  r = start.relativeTime(end, { field: 'year' });
  expect(r).toEqual(0.5);
  r = start.relativeTime(end, { field: 'month' });
  expect(r).toEqual(6);
  r = start.relativeTime(end, { field: 'day' });
  expect(r).toEqual(183);

  // TODO: increase test coverage
});

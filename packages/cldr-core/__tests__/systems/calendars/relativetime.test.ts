import { CalendarDate, GregorianDate } from '../../../src/systems';

const UTC = 'Etc/UTC';

// Sat March 11, 2000 8:00:25 AM UTC
const BASE = 952761625000;

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

test('basic difference', () => {
  let r: [string, number];
  let end: CalendarDate;
  const start = gregorian(BASE, UTC);

  // Adding 0.5 years to 2000-03-11 adds "183 days" which yields
  // 2000-09-10 which is "5 months, 30 days" from the start, since the
  // day of month differs.
  end = start.add({ year: 0.5 });

  r = start.relativeTime(end, 'year');
  expect(r).toEqual(['year', 0.5]);
  r = start.relativeTime(end, 'month');
  expect(r).toEqual(['month', 5.967741935483871]);
  r = start.relativeTime(end, 'day');
  expect(r).toEqual(['day', 183]);

  end = start.add({ month: 5.967741935483871 });
  // console.log(start.toString());
  // console.log(end.toString());

  r = start.relativeTime(end, 'year');
  expect(r).toEqual(['year', 0.5]);
  r = start.relativeTime(end, 'month');
  expect(r).toEqual(['month', 5.967741935483871]);
  r = start.relativeTime(end, 'day');
  expect(r).toEqual(['day', 183]);

  // Adding 6 months will attempt to keep the day of month constant,
  // which will yield 2000-09-11 which is "184 days" from the start
  // date.
  end = start.add({ month: 6 });

  r = start.relativeTime(end, 'year');
  expect(r).toEqual(['year', 0.5027322404371585]);
  r = start.relativeTime(end, 'month');
  expect(r).toEqual(['month', 6]);
  r = start.relativeTime(end, 'day');
  expect(r).toEqual(['day', 184]);

  // March 11 to September 11 is 184 days, which equals exactly 1/2 year
  end = start.add({ day: 184 });

  r = start.relativeTime(end, 'year');
  expect(r).toEqual(['year', 0.5027322404371585]);
  r = start.relativeTime(end, 'month');
  expect(r).toEqual(['month', 6]);
  r = start.relativeTime(end, 'day');
  expect(r).toEqual(['day', 184]);

  // TODO: increase test coverage
});

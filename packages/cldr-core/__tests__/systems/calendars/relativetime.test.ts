import { CalendarDate, GregorianDate } from '../../../src/systems';
import { MAR_11_2000, UTC } from './_referencedates';

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

test('basic difference', () => {
  let r: [string, number];
  let end: CalendarDate;
  const start = gregorian(MAR_11_2000, UTC);
  expect(start.toDateTimeString()).toEqual('2000-03-11 08:00:25.000');

  end = start.add({ year: 1 }); // truncated to 1
  expect(end.toDateTimeString()).toEqual('2001-03-11 08:00:25.000');

  r = start.relativeTime(end, 'year');
  expect(r).toEqual(['year', 1]);
  r = start.relativeTime(end, 'month');
  expect(r).toEqual(['month', 12]);
  r = start.relativeTime(end, 'day');
  expect(r).toEqual(['day', 365]);

  end = start.add({ month: 6 });

  r = start.relativeTime(end, 'year');
  expect(r).toEqual(['year', 0]);
  r = start.relativeTime(end, 'year', { rollupFractional: true });
  expect(r).toEqual(['year', 0.5]);
  r = start.relativeTime(end, 'month');
  expect(r).toEqual(['month', 6]);
  r = start.relativeTime(end, 'day');
  expect(r).toEqual(['day', 184]);

  // March 11 to September 11 is 184 days, which is 1/2 year.
  end = start.add({ day: 184 });

  r = start.relativeTime(end, 'year', { rollupFractional: true });
  expect(r).toEqual(['year', 0.5]);
  r = start.relativeTime(end, 'month');
  expect(r).toEqual(['month', 6]);
  r = start.relativeTime(end, 'day');
  expect(r).toEqual(['day', 184]);

  // TODO: increase test coverage
});

test('sign', () => {
  let r: [string, number];
  let end: CalendarDate;
  const start = gregorian(MAR_11_2000, UTC);
  expect(start.toDateTimeString()).toEqual('2000-03-11 08:00:25.000');

  end = start.add({ day: -5 });
  r = start.relativeTime(end);
  expect(r).toEqual(['day', -5]);
});

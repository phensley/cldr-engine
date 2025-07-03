import { CalendarDate, GregorianDate, TimePeriod, TimePeriodField } from '../../../src';
import { MAR_11_2000, NEW_YORK, SEP_01_2000, SEP_15_2000, UTC } from './_referencedates';

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

const period = (t: Partial<TimePeriod>): TimePeriod =>
  Object.assign({ year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0, millis: 0 }, t);

const cldrstr = (c: CalendarDate): string =>
  c.toDateTimeString({ includeZoneOffset: true, optionalMilliseconds: true });

test('difference year, month', () => {
  let t: TimePeriod;
  let end: CalendarDate;

  // Mar 11 2000
  let start = gregorian(MAR_11_2000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2000-03-11 03:00:25-05:00');

  end = start.add({ year: 3, day: 35 });
  expect(cldrstr(end)).toEqual('2003-04-15 03:00:25-04:00');

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 37, day: 4 }));

  end = start.add({ month: 37, day: 4 });
  expect(cldrstr(end)).toEqual('2003-04-15 03:00:25-04:00');

  t = start.difference(end, { fields: ['year', 'day'] });
  expect(t).toEqual(period({ year: 3, day: 35 }));

  // Sept 15 2000
  start = gregorian(SEP_15_2000, UTC);
  expect(cldrstr(start)).toEqual('2000-09-15 12:00:00+00:00');

  end = start.add({ month: 6, day: 2 });
  expect(cldrstr(end)).toEqual('2001-03-17 12:00:00+00:00');

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 6, day: 2 }));

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 183 }));

  end = start.add({ month: 6, day: -5 });
  expect(cldrstr(end)).toEqual('2001-03-10 12:00:00+00:00');

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 176 }));

  t = start.difference(end, { fields: ['year', 'day'] });
  expect(t).toEqual(period({ day: 176 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 5, day: 23 }));

  end = start.add({ month: 6 });
  expect(cldrstr(end)).toEqual('2001-03-15 12:00:00+00:00');

  t = start.difference(end, { fields: ['year'], rollupFractional: true });
  expect(t).toEqual(period({ year: 0.5 }));

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 181 }));

  // Sept 01 2000
  start = gregorian(SEP_01_2000, UTC);
  expect(cldrstr(start)).toEqual('2000-09-01 12:00:00+00:00');

  end = start.add({ month: 4, day: -5 });
  expect(cldrstr(end)).toEqual('2000-12-27 12:00:00+00:00');

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 117 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 3, day: 26 }));

  end = start.add({ month: 5, day: -5 });
  expect(cldrstr(end)).toEqual('2001-01-27 12:00:00+00:00');

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 148 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 4, day: 26 }));

  end = start.add({ month: 6, day: -5 });
  expect(cldrstr(end)).toEqual('2001-02-24 12:00:00+00:00');

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 176 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 5, day: 23 }));

  end = start.add({ day: 176 });
  expect(cldrstr(end)).toEqual('2001-02-24 12:00:00+00:00');

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 5, day: 23 }));

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 176 }));
});

test('difference year, month, day', () => {
  let t: TimePeriod;
  let end: CalendarDate;
  const start = gregorian(MAR_11_2000, NEW_YORK);

  // In the examples below, the start year is a leap year 2000
  // which has 366 days, and the next year 2001 has 365 days.

  end = start.add({ day: 52 });
  expect(cldrstr(end)).toEqual('2000-05-02 03:00:25-04:00');

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 52 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 1, day: 21 }));

  t = start.difference(end, { fields: ['year', 'day'] });
  expect(t).toEqual(period({ year: 0, day: 52 }));

  end = start.add({ day: 183 });
  expect(cldrstr(end)).toEqual('2000-09-10 03:00:25-04:00');

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 5, day: 30 }));

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 183 }));

  end = start.add({ day: 183, hour: 77, minute: 1000 });
  expect(cldrstr(end)).toEqual('2000-09-14 00:40:25-04:00');

  t = start.difference(end, { fields: ['year', 'month', 'day', 'hour'] });
  expect(t).toEqual(period({ month: 6, day: 2, hour: 21 }));

  t = start.difference(end, { fields: ['year', 'month', 'day'] });
  expect(t).toEqual(period({ month: 6, day: 2 }));

  // Next year

  end = start.add({ day: 365 + 183 });
  expect(cldrstr(end)).toEqual('2001-09-10 03:00:25-04:00');

  t = start.difference(end, { fields: ['year', 'month', 'day'] });
  expect(t).toEqual(period({ year: 1, month: 5, day: 30 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 17, day: 30 }));

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 548 }));

  end = start.add({ day: 365 + 182 });
  expect(cldrstr(end)).toEqual('2001-09-09 03:00:25-04:00');

  t = start.difference(end, { fields: ['year'] });
  expect(t).toEqual(period({ year: 1, month: 0 }));

  t = start.difference(end, { fields: ['year', 'month', 'day'] });
  expect(t).toEqual(period({ year: 1, month: 5, day: 29 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 17, day: 29 }));

  t = start.difference(end, { fields: ['day'] });
  expect(t).toEqual(period({ day: 365 + 182 }));
});

test('difference hour, minute, second, millis', () => {
  let t: TimePeriod;
  let end: CalendarDate;

  // Saturday, June 10, 2000 12:00:00 PM
  const start = gregorian(960638400000, 'UTC');
  expect(start.toString()).toEqual('Gregorian 2000-06-10 12:00:00.000 Etc/UTC');

  end = start.add({ day: 4 });

  t = start.difference(end, { fields: ['hour'] });
  expect(t).toEqual(period({ hour: 96 }));

  end = start.add({ day: 4, minute: 45 });
  expect(cldrstr(end)).toEqual('2000-06-14 12:45:00+00:00');

  t = start.difference(end, { fields: ['hour'] });
  expect(t).toEqual(period({ hour: 96 }));

  end = start.add({ day: 1 });
  expect(cldrstr(end)).toEqual('2000-06-11 12:00:00+00:00');

  t = start.difference(end, { fields: ['hour'] });
  expect(t).toEqual(period({ hour: 24 }));

  end = start.add({ hour: 6, minute: 30 });

  t = start.difference(end, { fields: ['hour', 'minute'] });
  expect(t).toEqual(period({ hour: 6, minute: 30 }));

  end = start.add({ hour: 6, minute: 15, second: 30 });

  t = start.difference(end, { fields: ['hour', 'minute'] });
  expect(t).toEqual(period({ hour: 6, minute: 15 }));

  t = start.difference(end, { fields: ['hour', 'minute', 'second'] });
  expect(t).toEqual(period({ hour: 6, minute: 15, second: 30 }));

  end = start.add({ hour: 6, minute: 15, second: 5 });

  t = start.difference(end, { fields: ['hour', 'minute', 'second'] });
  expect(t).toEqual(period({ hour: 6, minute: 15, second: 5 }));

  t = start.difference(end, { fields: ['hour', 'minute', 'second', 'millis'] });
  expect(t).toEqual(period({ hour: 6, minute: 15, second: 5, millis: 0 }));

  end = start.add({ millis: 5503 });

  t = start.difference(end, { fields: ['hour', 'minute', 'second', 'millis'] });
  expect(t).toEqual(period({ second: 5, millis: 503 }));

  end = start.add({ second: 1, millis: 5503 });

  t = start.difference(end, { fields: ['hour', 'minute', 'second', 'millis'] });
  expect(t).toEqual(period({ second: 6, millis: 503 }));
});

test('difference sub-day', () => {
  let t: TimePeriod;
  let end: CalendarDate;

  // Saturday, June 10, 2000 12:00:00 PM
  const start = gregorian(960638400000, 'UTC');
  expect(start.toString()).toEqual('Gregorian 2000-06-10 12:00:00.000 Etc/UTC');

  end = start.add({ day: 4, minute: -120 });

  t = start.difference(end, { fields: ['day', 'hour'] });
  expect(t).toEqual(period({ day: 3, hour: 22 }));
});

test('difference year wrap', () => {
  let t: TimePeriod;
  let end: CalendarDate;

  // Saturday, Dec 31, 1999 12:00:00 PM
  const start = gregorian(946641600000, 'UTC');
  expect(start.toString()).toEqual('Gregorian 1999-12-31 12:00:00.000 Etc/UTC');

  end = start.add({ day: 28 });

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ day: 28 }));
});

test('all fields', () => {
  let t: TimePeriod;
  let end: CalendarDate;
  const start = gregorian(MAR_11_2000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2000-03-11 03:00:25-05:00');

  end = start.add({ year: 1, month: 1, day: 1, hour: 12, minute: 30, second: 30, millis: 15000 });
  expect(cldrstr(end)).toEqual('2001-04-12 15:31:10-04:00');

  t = start.difference(end, { fields: ['year', 'month', 'day', 'hour', 'minute', 'second'] });
  expect(t).toEqual(period({ year: 1, month: 1, day: 1, hour: 12, minute: 30, second: 45 }));

  t = start.difference(end, { fields: ['year', 'month', 'day', 'hour', /* minute */ 'second'] });
  expect(t).toEqual(period({ year: 1, month: 1, day: 1, hour: 12, second: 30 * 60 + 45 }));

  t = start.difference(end, { fields: ['year', 'month', 'day', /* hour, minute */ 'second'] });
  expect(t).toEqual(period({ year: 1, month: 1, day: 1, second: 12 * 3600 + 30 * 60 + 45 }));

  t = start.difference(end, { fields: ['year', 'month', 'day', 'hour', 'minute'] });
  expect(t).toEqual(period({ year: 1, month: 1, day: 1, hour: 12, minute: 30 }));

  t = start.difference(end, { fields: ['year', 'month', 'day', /* hour */ 'minute'] });
  expect(t).toEqual(period({ year: 1, month: 1, day: 1, minute: 12 * 60 + 30 }));

  t = start.difference(end, { fields: ['year', 'month', 'day', 'hour'] });
  expect(t).toEqual(period({ year: 1, month: 1, day: 1, hour: 12 }));

  end = start.add({ year: 1, month: 1, day: 1, hour: 12 });

  t = start.difference(end, { fields: ['year', 'month', 'day'] });
  expect(t).toEqual(period({ year: 1, month: 1, day: 1 }));

  end = start.add({ year: 1, month: 1, day: 15, hour: 12 });

  t = start.difference(end, { fields: ['year', 'month'] });
  expect(t).toEqual(period({ year: 1, month: 1 }));
});

test('difference edge cases', () => {
  let t: TimePeriod;
  let end: CalendarDate;

  const start = gregorian(MAR_11_2000, 'UTC');

  end = start.add({ month: 7, day: 82 });

  t = start.difference(end, { fields: ['year', 'day'] });
  expect(t).toEqual(period({ day: 296 }));

  end = start.add({ month: 7, day: 92 });

  t = start.difference(end, { fields: ['year', 'day'] });
  expect(t).toEqual(period({ day: 306 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 10, day: 0 }));

  t = start.difference(end, { fields: ['month'] });
  expect(t).toEqual(period({ month: 10 }));

  end = start.add({ month: -3, day: -3 });

  t = start.difference(end, { fields: ['year', 'day'] });
  expect(t).toEqual(period({ day: 94 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 3, day: 3 }));

  end = start.add({ month: 0, day: 76 });

  t = start.difference(end, { fields: ['month'], rollupFractional: true });
  expect(t).toEqual(period({ month: 2.492772667542707 }));

  t = start.difference(end, { fields: ['month', 'day'] });
  expect(t).toEqual(period({ month: 2, day: 15 }));

  // Invalid fields are ignored
  t = start.difference(end, { fields: ['month', 'day', 'foobar' as TimePeriodField] });
  expect(t).toEqual(period({ month: 2, day: 15 }));

  // If no valid fields are passed in, it will
  // return the raw difference with no field rollup
  t = start.difference(end, { fields: ['foobar' as TimePeriodField, 'baz' as TimePeriodField] });
  expect(t).toEqual(period({ month: 2, day: 15 }));
});

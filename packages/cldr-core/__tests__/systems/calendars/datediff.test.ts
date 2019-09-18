import { CalendarDate, GregorianDate, TimePeriod } from '../../../src/systems';

const NEW_YORK = 'America/New_York';

// Sat March 11, 2000 8:00:25 AM UTC
const BASE = 952761625000;

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

const period = (t: TimePeriod): TimePeriod =>
  Object.assign({ year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0, millis: 0 }, t);

test('basic difference', () => {
  let t: TimePeriod;
  let end: CalendarDate;
  const start = gregorian(BASE, NEW_YORK);

  end = start.add({ day: 369 });
  t = start.difference(end);
  expect(t).toEqual(period({ year: 1, day: 4 }));

  end = start.add({ day: 419 });
  t = start.difference(end);
  expect(t).toEqual(period({ year: 1, month: 1, week: 3, day: 2 }));

  end = start.add({ year: 3, month: 17 });
  t = start.difference(end);
  expect(t).toEqual(period({ year: 4, month: 5 }));

  end = start.add({ day: 45 });
  t = start.difference(end);
  expect(t).toEqual(period({ month: 1, week: 2 }));

  end = start.add({ hour: 48 });
  t = start.difference(end);
  expect(t).toEqual(period({ day: 2 }));

  end = start.add({ day: 8, hour: 12 });
  t = start.difference(end);
  expect(t).toEqual(period({ week: 1, day: 1, hour: 12 }));

  end = start.add({ hour: 24 * 10 });
  t = start.difference(end);
  expect(t).toEqual(period({ week: 1, day: 3 }));
});

test('difference year, month, day', () => {
  let t: TimePeriod;
  let end: CalendarDate;
  const start = gregorian(BASE, NEW_YORK);

  // In the examples below, the start year is a leap year 2000
  // which has 366 days, and the next year 2001 has 365 days.

  end = start.add({ day: 183 });

  t = start.difference(end, ['month', 'day']);
  expect(t).toEqual(period({ month: 5, day: 30 }));

  t = start.difference(end, ['day']);
  expect(t).toEqual(period({ day: 183 }));

  end = start.add({ day: 183.5 });

  t = start.difference(end, ['year', 'month', 'day', 'hour']);
  expect(t).toEqual(period({ month: 5, day: 30, hour: 12 }));

  end = start.add({ day: 183.5 });

  t = start.difference(end, ['year', 'month', 'day']);
  expect(t).toEqual(period({ month: 5, day: 30.5 }));

  end = start.add({ day: 184.5 });

  t = start.difference(end, ['year', 'day']);
  expect(t).toEqual(period({ year: 0.5, day: 0.5 }));

  t = start.difference(end, ['year', 'month', 'day']);
  expect(t).toEqual(period({ month: 6, day: 0.5 }));

  // Next year

  end = start.add({ day: 366 + 182 });

  t = start.difference(end, ['year', 'month', 'day']);
  expect(t).toEqual(period({ year: 1, month: 5, day: 30 }));

  end = start.add({ day: 366 + 183 });

  t = start.difference(end, ['year']);
  expect(t).toEqual(period({ year: 1.5 }));

  t = start.difference(end, ['month', 'day']);
  expect(t).toEqual(period({ month: 18 }));

  t = start.difference(end, ['day']);
  expect(t).toEqual(period({ day: 366 + 183 }));
});

test('difference hour, minute, second, millis', () => {
  let t: TimePeriod;
  let end: CalendarDate;

  // Saturday, June 10, 2000 12:00:00 PM
  const start = gregorian(960638400000, 'UTC');
  expect(start.toString()).toEqual('Gregorian 2000-06-10 12:00:00.000 Etc/UTC');

  end = start.add({ day: 4 });
  t = start.difference(end, ['hour']);
  expect(t).toEqual(period({ hour: 96 }));

  end = start.add({ day: 4.25, minute: 45 });
  t = start.difference(end, ['hour']);
  expect(t).toEqual(period({ hour: 102.75 }));

  end = start.add({ day: 0.25 });
  t = start.difference(end, ['hour']);
  expect(t).toEqual(period({ hour: 6 }));

  end = start.add({ hour: 6.5 });
  t = start.difference(end, ['hour', 'minute']);
  expect(t).toEqual(period({ hour: 6, minute: 30 }));

  end = start.add({ hour: 6.5, minute: 15.5 });
  t = start.difference(end, ['hour', 'minute']);
  expect(t).toEqual(period({ hour: 6, minute: 45.5 }));
  t = start.difference(end, ['hour', 'minute', 'second']);
  expect(t).toEqual(period({ hour: 6, minute: 45, second: 30 }));

  end = start.add({ hour: 6.5, minute: 15.5, second: 5.5 });
  t = start.difference(end, ['hour', 'minute', 'second']);
  expect(t).toEqual(period({ hour: 6, minute: 45, second: 35.5 }));
  t = start.difference(end, ['hour', 'minute', 'second', 'millis']);
  expect(t).toEqual(period({ hour: 6, minute: 45, second: 35, millis: 500 }));

  end = start.add({ millis: 5503 });
  t = start.difference(end, ['hour', 'minute', 'second', 'millis']);
  expect(t).toEqual(period({ second: 5, millis: 503 }));

  end = start.add({ millis: 5503.6 });
  t = start.difference(end, ['hour', 'minute', 'second', 'millis']);
  expect(t).toEqual(period({ second: 5, millis: 504 }));
});

test('comparison', () => {
  let end: CalendarDate;
  const start = gregorian(BASE, NEW_YORK);

  end = start.add({ year: 1 });
  expect(start.compare(end)).toEqual(-1);

  end = start.add({ millis: 1 });
  expect(start.compare(end)).toEqual(-1);

  end = start.add({ });
  expect(start.compare(end)).toEqual(0);

  end = start.add({ year: 0, millis: 0 });
  expect(start.compare(end)).toEqual(0);

  end = start.add({ millis: -1 });
  expect(start.compare(end)).toEqual(1);

  end = start.add({ year: -1 });
  expect(start.compare(end)).toEqual(1);
});

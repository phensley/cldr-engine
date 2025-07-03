import { TimePeriodField } from '@phensley/cldr-core/lib';
import { CalendarDate, GregorianDate, TimePeriod } from '../../../src';
import { MAR_11_2000, NEW_YORK } from './_referencedates';

const gregorian = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, 1, 1);

const period = (t: Partial<TimePeriod>): TimePeriod =>
  Object.assign({ year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0, millis: 0 }, t);

const cldrstr = (c: CalendarDate): string =>
  c.toDateTimeString({ includeZoneOffset: true, optionalMilliseconds: true });

test('negative time', () => {
  let end: GregorianDate;

  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');

  end = start.add({ day: 2, hour: -7 });
  expect(cldrstr(end)).toEqual('2024-03-02 01:30:00-05:00');
  expect(start.difference(end)).toEqual(period({ day: 1, hour: 17 }));
});

test('difference month vs day', () => {
  let end: GregorianDate;

  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');

  end = start.add({ month: 11, day: -28 });
  expect(cldrstr(end)).toEqual('2025-01-01 08:30:00-05:00');
  expect(start.difference(end)).toEqual(period({ year: 0, month: 10, day: 3 }));

  end = start.add({ year: 1, month: -1 });
  expect(cldrstr(end)).toEqual('2025-01-29 08:30:00-05:00');
  expect(start.difference(end)).toEqual(period({ month: 11 }));

  end = start.add({ year: 1, day: -5 });
  expect(cldrstr(end)).toEqual('2025-02-23 08:30:00-05:00');
  expect(start.difference(end)).toEqual(period({ month: 11, day: 25 }));
});

test('all flags', () => {
  let end: GregorianDate;
  const fields: TimePeriodField[] = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millis'];

  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');

  end = start.add({ year: 1, month: 1 });
  expect(cldrstr(end)).toEqual('2025-03-29 08:30:00-04:00');
  expect(start.difference(end)).toEqual(period({ year: 1, month: 1 }));
  expect(start.difference(end, { fields })).toEqual(period({ year: 1, month: 1 }));
});

test('weeks', () => {
  let end: GregorianDate;

  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');

  end = start.add({ day: 15 });
  expect(start.difference(end, { fields: ['week', 'day'] })).toEqual(period({ week: 2, day: 1 }));

  end = start.add({ day: 15 });
  expect(start.difference(end, { fields: ['day'], includeWeeks: true })).toEqual(period({ week: 0, day: 15 }));
});

test('leap year', () => {
  let end: GregorianDate;

  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');

  end = start.add({ year: 1 });
  expect(cldrstr(end)).toEqual('2025-02-28 08:30:00-05:00');
  expect(start.difference(end)).toEqual(period({ month: 11, day: 30 }));

  end = start.add({ year: 1, month: 1 });
  expect(cldrstr(end)).toEqual('2025-03-29 08:30:00-04:00');
  expect(start.difference(end)).toEqual(period({ year: 1, month: 1 }));

  end = start.add({ year: 1, month: 2, day: 3 });
  expect(cldrstr(end)).toEqual('2025-05-02 08:30:00-04:00');
  expect(start.difference(end)).toEqual(period({ year: 1, month: 2, day: 3 }));

  end = start.add({ year: 1, month: 2, day: 17 });
  expect(cldrstr(end)).toEqual('2025-05-16 08:30:00-04:00');
  expect(start.difference(end, { includeWeeks: true })).toEqual(period({ year: 1, month: 2, week: 2, day: 3 }));
});

test('month backwards', () => {
  let end: GregorianDate;

  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');

  end = start.add({ year: 1, month: -1 });
  expect(cldrstr(end)).toEqual('2025-01-29 08:30:00-05:00');
  expect(start.difference(end)).toEqual(period({ month: 11 }));

  end = start.add({ year: 1, day: -5 });
  expect(cldrstr(end)).toEqual('2025-02-23 08:30:00-05:00');
  expect(start.difference(end)).toEqual(period({ month: 11, day: 25 }));

  end = start.add({ year: 1, month: -1, day: -5 });
  expect(cldrstr(end)).toEqual('2025-01-24 08:30:00-05:00');
  expect(start.difference(end)).toEqual(period({ month: 10, day: 26 }));

  end = start.add({ year: 1, month: -3 });
  expect(cldrstr(end)).toEqual('2024-11-29 08:30:00-05:00');
  expect(start.difference(end)).toEqual(period({ month: 9 }));
});

test('basic difference', () => {
  let t: TimePeriod;
  let end: CalendarDate;
  const start = gregorian(MAR_11_2000, NEW_YORK);

  end = start.add({ day: 369 }); // Mar 15, 2001

  t = start.difference(end);
  expect(t).toEqual(period({ year: 1, day: 4 }));

  end = start.add({ day: 419 }); // May 4, 2001

  t = start.difference(end, { includeWeeks: true });
  expect(t).toEqual(period({ year: 1, month: 1, week: 3, day: 2 }));
  t = start.difference(end);
  expect(t).toEqual(period({ year: 1, month: 1, week: 0, day: 23 }));

  end = start.add({ year: 3, month: 17 }); // Aug 11, 2004

  t = start.difference(end);
  expect(t).toEqual(period({ year: 4, month: 5 }));

  end = start.add({ day: 45 }); // April 25, 2000

  t = start.difference(end, { includeWeeks: true });
  expect(t).toEqual(period({ month: 1, week: 2 }));

  end = start.add({ hour: 48 }); // March 13, 2000

  t = start.difference(end);
  expect(t).toEqual(period({ day: 2 }));

  end = start.add({ day: 8, hour: 12 }); // March 19, 2000

  t = start.difference(end, { includeWeeks: true });
  expect(t).toEqual(period({ week: 1, day: 1, hour: 12 }));

  end = start.add({ hour: 24 * 10 }); // March 21, 2000

  t = start.difference(end, { includeWeeks: true });
  expect(t).toEqual(period({ week: 1, day: 3 }));
});

test('signed difference 1', () => {
  let t: TimePeriod;
  let end: CalendarDate;
  const start = gregorian(MAR_11_2000, NEW_YORK);

  end = start.add({ day: 369 }); // Mar 15, 2001

  t = end.differenceSigned(start);
  expect(t).toEqual(period({ year: -1, day: -4 }));

  t = start.differenceSigned(end);
  expect(t).toEqual(period({ year: 1, day: 4 }));

  end = start.add({ day: 419 }); // May 4, 2001
  expect(cldrstr(end)).toEqual('2001-05-04 03:00:25-04:00');
  expect(end.differenceSigned(start, { includeWeeks: true })).toEqual(
    period({ year: -1, month: -1, week: -3, day: -3 }),
  );
  expect(end.differenceSigned(start, { includeWeeks: false })).toEqual(
    period({ year: -1, month: -1, week: 0, day: -24 }),
  );

  expect(start.differenceSigned(end, { includeWeeks: true })).toEqual(period({ year: 1, month: 1, week: 3, day: 2 }));
  expect(start.differenceSigned(end, { includeWeeks: false })).toEqual(period({ year: 1, month: 1, week: 0, day: 23 }));
});

test('basic difference 2', () => {
  let end: CalendarDate;
  const start = gregorian(MAR_11_2000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2000-03-11 03:00:25-05:00');

  // Year 2000
  //          March                April                  May
  //  Su Mo Tu We Th Fr Sa  Su Mo Tu We Th Fr Sa  Su Mo Tu We Th Fr Sa
  //            1  2  3  4                     1      1  2  3  4  5  6
  //   5  6  7  8  9 10 11   2  3  4  5  6  7  8   7  8  9 10 11 12 13
  //  12 13 14 15 16 17 18   9 10 11 12 13 14 15  14 15 16 17 18 19 20
  //  19 20 21 22 23 24 25  16 17 18 19 20 21 22  21 22 23 24 25 26 27
  //  26 27 28 29 30 31     23 24 25 26 27 28 29  28 29 30 31
  //                        30

  end = start.add({ year: 1, month: 2, day: 3 });
  expect(cldrstr(end)).toEqual('2001-05-14 03:00:25-04:00');
  expect(start.until(end, { fields: ['month'] })).toEqual(period({ month: 14 }));
  expect(start.until(end, { fields: ['day'] })).toEqual(period({ day: 429 }));
  expect(start.until(end, { fields: ['year', 'day'] })).toEqual(period({ year: 1, day: 64 }));
});

test('diff all fields', () => {
  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');
  let end = start.add({ year: 1, month: 2, day: 3 });
  expect(start.until(end, {})).toEqual(period({ year: 1, month: 2, day: 3 }));

  end = start.add({ year: 1, month: 2, day: 17 });
  expect(start.until(end, { includeWeeks: true })).toEqual(period({ year: 1, month: 2, week: 2, day: 3 }));

  expect(start.until(end, { fields: ['year', 'month', 'day', 'week'] })).toEqual(
    period({ year: 1, month: 2, week: 2, day: 3 }),
  );
});

test('diff YMD', () => {
  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');
  let end = start.add({ year: 1, month: 2, day: 3 });
  expect(start.until(end, { fields: ['year', 'month', 'day'] })).toEqual(period({ year: 1, month: 2, day: 3 }));

  end = start.add({ year: 1, month: 2, day: 17 });
  expect(start.until(end, { fields: ['year', 'month', 'day'] })).toEqual(period({ year: 1, month: 2, day: 17 }));

  expect(start.until(end, { fields: ['year', 'month', 'day', 'week'] })).toEqual(
    period({ year: 1, month: 2, week: 2, day: 3 }),
  );
});

test('diff Y', () => {
  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');
  let end = start.add({ year: 1, month: 2, day: 3 });
  expect(start.until(end, { fields: ['year'] })).toEqual(period({ year: 1 }));
});

test('diff M', () => {
  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');
  let end = start.add({ year: 1, month: 2, day: 3 });
  expect(start.until(end, { fields: ['month'] })).toEqual(period({ month: 14 }));
});

test('diff YM', () => {
  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');
  let end = start.add({ year: 1, month: 2, day: 3 });
  expect(cldrstr(end)).toEqual('2025-05-02 08:30:00-04:00');
  expect(start.until(end, { fields: ['year', 'month'] })).toEqual(period({ year: 1, month: 2 }));
});

test('diff D', () => {
  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');
  let end = start.add({ year: 1, month: 2, day: 3 });
  expect(cldrstr(end)).toEqual('2025-05-02 08:30:00-04:00');
  expect(start.until(end, { fields: ['day'] })).toEqual(period({ day: 428 }));
});

test('diff YD', () => {
  let end: GregorianDate;

  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');
  end = start.add({ year: 1 });
  expect(cldrstr(end)).toEqual('2025-02-28 08:30:00-05:00');
  expect(start.until(end, { fields: ['year', 'day'] })).toEqual(period({ day: 365 }));

  end = start.add({ year: 1, month: 2 });
  expect(cldrstr(end)).toEqual('2025-04-29 08:30:00-04:00');
  expect(start.until(end, { fields: ['year', 'day'] })).toEqual(period({ year: 1, day: 60 }));
});

test('diff MD', () => {
  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');
  let end = start.add({ year: 1, month: 2, day: 3 });
  expect(cldrstr(end)).toEqual('2025-05-02 08:30:00-04:00');
  expect(start.until(end, { fields: ['month', 'day'] })).toEqual(period({ month: 14, day: 3 }));
});

test('diff DH', () => {
  let end: GregorianDate;

  //  February 29, 2024 8:30:00 AM GMT-05:00
  const start = gregorian(1709213400000, NEW_YORK);
  expect(cldrstr(start)).toEqual('2024-02-29 08:30:00-05:00');

  end = start.add({ year: 1, month: 2, day: 3, hour: 15 });
  expect(cldrstr(end)).toEqual('2025-05-02 23:30:00-04:00');
  expect(start.until(end, { fields: ['day', 'hour'] })).toEqual(period({ month: 0, day: 428, hour: 15 }));

  end = start.add({ year: 1, month: 2, day: 3 });
  expect(cldrstr(end)).toEqual('2025-05-02 08:30:00-04:00');
  expect(start.until(end, { fields: ['day', 'hour'] })).toEqual(period({ month: 0, day: 428 }));
});

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

test('difference rollup', () => {
  let t: TimePeriod;
  let end: CalendarDate;
  const start = gregorian(BASE, NEW_YORK);

  // 2000 is a leap year so 183 days is 1/2 year
  end = start.add({ day: 183 });
  t = start.difference(end, ['year']);
  expect(t).toEqual(period({ year: 0.5 }));
  t = start.difference(end, ['month', 'day']);
  expect(t).toEqual(period({ month: 5, day: 30 }));
  t = start.difference(end, ['day']);
  expect(t).toEqual(period({ day: 183 }));

  end = start.add({ day: 365 + 183 });
  t = start.difference(end, ['year']);
  expect(t).toEqual(period({ year: 1.5 }));
  t = start.difference(end, ['month', 'day']);
  expect(t).toEqual(period({ month: 17, day: 30 }));
  t = start.difference(end, ['day']);
  expect(t).toEqual(period({ day: 365 + 183 }));
});

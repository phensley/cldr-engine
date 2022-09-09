import { calendarsApi } from '../../_helpers';
import { CalendarDate, DateIntervalFormatOptions } from '../../../src';

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

test('interval defaulting', () => {
  const api = calendarsApi('en');
  const zoneId = 'America/New_York';
  const start = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId });

  let end: CalendarDate;
  let s: string;

  // Omitting the skeleton will choose a reasonable default

  end = start.add({ day: 0.1 });
  s = api.formatDateInterval(start, end);
  expect(s).toEqual('3:00 – 5:24 AM');

  end = start.add({ day: 0.6 });
  s = api.formatDateInterval(start, end);
  expect(s).toEqual('3:00 AM – 5:24 PM');

  end = start.add({ day: 0.9 });
  s = api.formatDateInterval(start, end);
  expect(s).toEqual('Mar 11 – 12, 2018');

  end = start.add({ week: 0.9 });
  s = api.formatDateInterval(start, end);
  expect(s).toEqual('Mar 11 – 17, 2018');

  end = start.add({ month: 0.9 });
  s = api.formatDateInterval(start, end);
  expect(s).toEqual('Mar 11 – Apr 8, 2018');

  end = start.add({ year: 2.9 });
  s = api.formatDateInterval(start, end);
  expect(s).toEqual('Mar 11, 2018 – Feb 3, 2021');
});

test('interval date/time choice', () => {
  const api = calendarsApi('en');
  const zoneId = 'America/New_York';
  const start = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId });

  let end: CalendarDate;
  let s: string;

  const opts: DateIntervalFormatOptions = { date: 'EEEyMMMd', time: 'Hms' };

  end = start.add({ minute: 33 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('03:00 – 03:33');

  end = start.add({ day: 0.1 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('03:00 – 05:24');

  end = start.add({ day: 0.4 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('3:00 AM – 12:36 PM');

  end = start.add({ day: 0.9 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Sun, Mar 11 – Mon, Mar 12, 2018');

  end = start.add({ day: 72.3 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Sun, Mar 11 – Tue, May 22, 2018');

  end = start.add({ year: 2.9 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Sun, Mar 11, 2018 – Wed, Feb 3, 2021');

  opts.date = 'yMMM';
  end = start.add({ year: 2.9 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Mar 2018 – Feb 2021');

  // If date differs, always include some time fields
  opts.date = 'EEEyMMMdHm';
  end = start.add({ day: 0.9 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Sun, Mar 11, 2018, 03:00 – Mon, Mar 12, 2018, 00:36');

  opts.date = 'EEEB';
  end = start.add({ day: 0.9 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Sun, 3 at night – Mon, 12 at night');

  opts.atTime = false;
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Sun, 3 at night – Mon, 12 at night');

  // If time differs, always include some date fields
  opts.date = undefined;
  opts.time = 'EBhm';
  end = start.add({ day: 0.3 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Sun, 3:00 – 10:12 in the morning');

  opts.time = 'MMMdh';
  end = start.add({ day: 0.3 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Mar 11, 3 – 10 AM');

  opts.alt = { dayPeriod: 'casing' };
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('Mar 11, 3 – 10 am');
});

test('interval mismatch', () => {
  const api = calendarsApi('en');
  const zoneId = 'America/New_York';
  const start = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId });

  let end: CalendarDate;
  let s: string;

  end = start.add({ week: 2 });
  s = api.formatDateInterval(start, end, { skeleton: 'hm' });
  expect(s).toEqual('11, 3:00 AM – 25, 3:00 AM');

  end = start.add({ month: 2 });
  s = api.formatDateInterval(start, end, { skeleton: 'hm' });
  expect(s).toEqual('3/11, 3:00 AM – 5/11, 3:00 AM');
});

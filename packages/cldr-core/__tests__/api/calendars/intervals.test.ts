import { calendarsApi } from '../../_helpers';
import { CalendarDate, DateIntervalFormatOptions, TimePeriod } from '../../../src';

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

type TestCase = [Partial<TimePeriod>, string];

type TestCases = [DateIntervalFormatOptions, TestCase[]][];

const runt = (name: string, locale: string, base: number, zone: string, tests: TestCases) => {
  const api = calendarsApi(locale);
  const start = api.toGregorianDate({ date: base, zoneId: zone });
  let actual: string;
  let i = 1;
  let j = 1;
  for (const tst of tests) {
    const [opts, cases] = tst;
    for (const [time, expected] of cases) {
      test(`${name} test ${i} case ${j}`, () => {
        const end = start.add(time);
        const [s, e] = end.compare(start) === -1 ? [end, start] : [start, end];
        actual = api.formatDateInterval(s, e, opts);
        expect(actual).toEqual(expected);
      });
      j++;
    }
    i++;
  }
};

test('same day', () => {
  const api = calendarsApi('en');
  const base = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId: 'America/New_York' });
  const later = base.add({ hour: 1 });

  let s = api.formatDateInterval(base, later, { skeleton: 'yMMMd' });
  expect(s).toEqual('Mar 11, 2018');
});

test('same time', () => {});

runt('English defaults', 'en', MARCH_11_2018_070025_UTC, 'America/New_York', [
  [
    {}, // default skeleton: yMMMd or jm
    [
      // "h:mm – h:mm a"
      [{ minute: 20 }, '3:00 – 3:20 AM'],
      // "h:mm – h:mm a"
      [{ hour: 3 }, '3:00 – 6:00 AM'],
      // "h:mm a – h:mm a"
      [{ hour: 10 }, '3:00 AM – 1:00 PM'],
      // "MMM d – d, y"
      [{ day: 2 }, 'Mar 11 – 13, 2018'],
      // "MMM d – MMM d, y"
      [{ month: 1 }, 'Mar 11 – Apr 11, 2018'],
      // "MMM d, y – MMM d, y"
      [{ year: 1 }, 'Mar 11, 2018 – Mar 11, 2019'],
    ],
  ],
]);

runt('English skeletons', 'en', MARCH_11_2018_070025_UTC, 'America/New_York', [
  [
    { skeleton: 'jmv' },
    [
      // "h:mm – h:mm a v"
      [{ minute: 20 }, '3:00 – 3:20 AM ET'],
      // "h:mm – h:mm a v"
      [{ hour: 4 }, '3:00 – 7:00 AM ET'],
      // "h:mm a – h:mm a v"
      [{ hour: 13 }, '3:00 AM – 4:00 PM ET'],
      // "h:mm a – h:mm a v"
      [{ day: 2 }, 'Mar 11, 2018, 3:00 AM ET – Mar 13, 2018, 3:00 AM ET'],
    ],
  ],
  [
    { skeleton: 'Hmv' },
    [
      // "HH:mm – HH:mm v"
      [{ minute: 20 }, '03:00 – 03:20 ET'],
      // "HH:mm – HH:mm v"
      [{ hour: 4 }, '03:00 – 07:00 ET'],
      // "HH:mm – HH:mm v"
      [{ hour: 13 }, '03:00 – 16:00 ET'],
    ],
  ],
  [
    { skeleton: 'yMdjm', wrap: 'full', atTime: true },
    [
      [{ hour: 4 }, '3/11/2018 at 3:00 – 7:00 AM'],
      [{ day: 4 }, '3/11/2018 at 3:00 AM – 3/15/2018 at 3:00 AM'],
    ],
  ],
]);

runt('English flex dayperiod', 'en', MARCH_11_2018_070025_UTC, 'America/New_York', [
  [
    { skeleton: 'Bjm' },
    [
      [{ hour: -2 }, '12:00 midnight – 3:00 at night'],
      [{ minute: 20 }, '3:00 – 3:20 at night'],
      [{ hour: 3 }, '3:00 at night – 6:00 in the morning'],
      [{ hour: 9 }, '3:00 at night – 12:00 noon'],
    ],
  ],
  [
    { skeleton: 'yMMMdBj' },
    [
      [{ hour: -2 }, 'Mar 11, 2018, 12 midnight – 3 at night'],
      [{ minute: 20 }, 'Mar 11, 2018, 3 – 3 at night'],
      [{ hour: 3 }, 'Mar 11, 2018, 3 at night – 6 in the morning'],
      [{ hour: 9 }, 'Mar 11, 2018, 3 at night – 12 noon'],
    ],
  ],
]);

runt('English field adjustments', 'en', MARCH_11_2018_070025_UTC, 'America/New_York', [
  [
    { skeleton: 'GEEEEyMMMMdd' },
    [
      // "E, MMM d – E, MMM d, y G"
      [{ day: -8 }, 'Saturday, March 03 – Sunday, March 11, 2018 AD'],
      // "E, MMM d – E, MMM d, y G"
      [{ month: 7 }, 'Sunday, March 11 – Thursday, October 11, 2018 AD'],
      // "E, MMM d, y – E, MMM d, y G"
      [{ year: 2 }, 'Sunday, March 11, 2018 – Wednesday, March 11, 2020 AD'],
      // "E, MMM d, y G – E, MMM d, y G"
      [{ year: -2030 }, 'Wednesday, March 11, 13 BC – Sunday, March 11, 2018 AD'],
    ],
  ],
]);

runt('English full skeletons', 'en', MARCH_11_2018_070025_UTC, 'America/New_York', [
  [
    { skeleton: 'yMMMdjmv' },
    [
      [{}, 'Mar 11, 2018, 3:00 AM ET'],
      [{ hour: 3 }, 'Mar 11, 2018, 3:00 – 6:00 AM ET'],
      [{ day: 2 }, 'Mar 11, 2018, 3:00 AM ET – Mar 13, 2018, 3:00 AM ET'],
    ],
  ],
]);

runt('German defaults', 'de', MARCH_11_2018_070025_UTC, 'Europe/Berlin', [
  [
    {},
    [
      [{ minute: 20 }, '08:00–08:20 Uhr'],
      [{ hour: 10 }, '08:00–18:00 Uhr'],
      [{ day: 2 }, '11.–13. März 2018'],
    ],
  ],
  [
    { skeleton: 'yMdjm', wrap: 'full' },
    [
      [{ day: 10, hour: 10 }, '11.3.2018 um 08:00 – 21.3.2018 um 18:00'],
      [{ year: 20 }, '11.3.2018 um 08:00 – 11.3.2038 um 08:00'],
    ],
  ],
]);

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

  const opts: DateIntervalFormatOptions = { date: 'EEEyMMMd', time: 'jms' };

  end = start.add({ minute: 33 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('3:00\u2009–\u20093:33\u202fAM');

  end = start.add({ day: 0.1 });
  s = api.formatDateInterval(start, end, opts);
  expect(s).toEqual('3:00 – 5:24\u202fAM');

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
  expect(s).toEqual('Sun, 3:00 at night – 10:12 in the morning');

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
  expect(s).toEqual('Mar 11, 2018, 3:00 AM – Mar 25, 2018, 3:00 AM');

  s = api.formatDateInterval(start, end, { skeleton: 'hm', strict: true });
  expect(s).toEqual('3:00 – 3:00 AM');

  end = start.add({ month: 2 });
  s = api.formatDateInterval(start, end, { skeleton: 'hm' });
  expect(s).toEqual('Mar 11, 2018, 3:00 AM – May 11, 2018, 3:00 AM');

  s = api.formatDateInterval(start, end, { skeleton: 'hm', strict: true });
  expect(s).toEqual('3:00 – 3:00 AM');
});

test('interval context', () => {
  const api = calendarsApi('fr');
  const zoneId = 'America/New_York';
  const start = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId });

  let end: CalendarDate;
  let s: string;

  end = start.add({ week: 2 });
  s = api.formatDateInterval(start, end, { skeleton: 'yMMMEd', context: 'middle-of-text' });
  expect(s).toEqual('dim. 11 – dim. 25 mars 2018');

  s = api.formatDateInterval(start, end, { skeleton: 'yMMMEd', context: 'begin-sentence' });
  expect(s).toEqual('Dim. 11 – dim. 25 mars 2018');
});

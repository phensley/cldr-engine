import { ContextType } from '@phensley/cldr-types';

import { calendarsApi } from '../../_helpers';
import { CalendarDate } from '../../../src';

const UTC = 'UTC';

// Sun, March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

test('format relative time', () => {
  const context: ContextType = 'begin-sentence';
  const api = calendarsApi('en');
  let s: string;
  let end: CalendarDate;

  const start = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId: UTC });

  s = api.formatRelativeTime(start, start);
  expect(s).toEqual('now');

  s = api.formatRelativeTime(start, start, { context });
  expect(s).toEqual('Now');

  end = start.add({ millis: 250 });

  s = api.formatRelativeTime(start, end);
  expect(s).toEqual('now');

  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('Now');

  end = start.add({ millis: 750 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('In 1 second');

  end = start.add({ second: 30 });
  s = api.formatRelativeTime(start, end);
  expect(s).toEqual('in 30 seconds');

  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('In 30 seconds');

  end = start.add({ minute: -32 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('32 minutes ago');

  end = start.add({ day: -27 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('4 weeks ago');

  end = start.add({ day: -27 });
  s = api.formatRelativeTime(start, end, { context, maximumFractionDigits: 1 });
  expect(s).toEqual('3.9 weeks ago');

  end = start.add({ week: 1 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('Next week');

  end = start.add({ week: 2 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('In 2 weeks');

  end = start.add({ week: 2 });
  s = api.formatRelativeTime(start, end, { context, dayOfWeek: true });
  expect(s).toEqual('In 2 Sundays');

  end = start.add({ year: 0.5 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('In 6 months');

  end = start.add({ month: 3000 });
  s = api.formatRelativeTime(start, end, { context, field: 'month' });
  expect(s).toEqual('In 3,000 months');

  s = api.formatRelativeTime(start, end, { context, field: 'month', group: false });
  expect(s).toEqual('In 3000 months');

  end = start.add({ year: 0.5 });
  s = api.formatRelativeTime(start, end, { context, width: 'short' });
  expect(s).toEqual('In 6 mo.');

  end = start.add({ year: 1.5 });
  s = api.formatRelativeTime(start, end, { context, round: 'floor' });
  expect(s).toEqual('Next year');

  end = start.add({ year: 1.5 });
  s = api.formatRelativeTime(start, end, { context, width: 'short', round: 'floor' });
  expect(s).toEqual('Next yr.');

  end = start.add({ year: 1.5 });
  s = api.formatRelativeTime(start, end, { context, width: 'narrow', round: 'floor' });
  expect(s).toEqual('Next yr.');
});

test('specific field', () => {
  const context: ContextType = 'begin-sentence';
  const api = calendarsApi('en');
  let s: string;
  let end: CalendarDate;

  const start = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId: UTC });

  end = start.add({ year: 1.5 });
  s = api.formatRelativeTime(start, end, { context, field: 'year' });
  expect(s).toEqual('In 2 years');

  s = api.formatRelativeTime(start, end, { context, field: 'year', minimumFractionDigits: 1 });
  expect(s).toEqual('In 1.5 years');

  s = api.formatRelativeTime(start, end, { context, field: 'month' });
  expect(s).toEqual('In 18 months');

  end = start.add({ month: 6 });
  s = api.formatRelativeTime(start, end, { context, field: 'day' });
  expect(s).toEqual('In 184 days');

  end = start.add({ day: 90, hour: 12, minute: 30 });

  s = api.formatRelativeTime(start, end, { context, field: 'day' });
  expect(s).toEqual('In 91 days');

  s = api.formatRelativeTime(start, end, { context, field: 'day', maximumFractionDigits: 1 });
  expect(s).toEqual('In 90.5 days');
});

test('numeric only', () => {
  const context: ContextType = 'begin-sentence';
  const api = calendarsApi('en');
  let s: string;
  let end: CalendarDate;

  const start = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId: UTC });

  end = start.add({});
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('Now');

  s = api.formatRelativeTime(start, end, { context, field: 'day' });
  expect(s).toEqual('Today');

  s = api.formatRelativeTime(start, end, { context, numericOnly: true });
  expect(s).toEqual('In 0 seconds');

  s = api.formatRelativeTime(start, end, { context, numericOnly: true, field: 'hour' });
  expect(s).toEqual('In 0 hours');

  s = api.formatRelativeTime(start, end, { context, numericOnly: true, alwaysNow: true });
  expect(s).toEqual('Now');

  end = start.add({ year: 1 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('Next year');

  s = api.formatRelativeTime(start, end, { context, numericOnly: true });
  expect(s).toEqual('In 1 year');
});

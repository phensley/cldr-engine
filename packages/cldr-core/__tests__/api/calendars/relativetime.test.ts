import { ContextType } from '@phensley/cldr-schema';

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

  end = start.add({ millis: 250 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('Now');

  end = start.add({ millis: 750 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('In 1 second');

  end = start.add({ second: 30 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('In 30 seconds');

  end = start.add({ minute: -32 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('32 minutes ago');

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

  end = start.add({ year: 0.5 });
  s = api.formatRelativeTime(start, end, { context, width: 'short' });
  expect(s).toEqual('In 6 mo.');

  end = start.add({ year: 1.5 });
  s = api.formatRelativeTime(start, end, { context, round: 'floor' });
  expect(s).toEqual('Next year');

  end = start.add({ year: 1.5 });
  s = api.formatRelativeTime(start, end, { context, width: 'short', round: 'floor' });
  expect(s).toEqual('Next yr.');
});

test('specific field', () => {
  const context: ContextType = 'begin-sentence';
  const api = calendarsApi('en');
  let s: string;
  let end: CalendarDate;

  const start = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId: UTC });

  end = start.add({ year: 1.5 });
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

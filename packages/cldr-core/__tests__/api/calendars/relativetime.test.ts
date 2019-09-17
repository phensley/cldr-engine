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
  end = start.add({ week: 1 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('Next week');

  end = start.add({ week: 2 });
  s = api.formatRelativeTime(start, end, { context });
  expect(s).toEqual('In 2 weeks');

  end = start.add({ week: 2 });
  s = api.formatRelativeTime(start, end, { context, dayOfWeek: true });
  expect(s).toEqual('In 2 Sundays');
});

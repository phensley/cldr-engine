import { calendarsApi } from '../../_helpers';

import {
  CalendarType,
  ZonedDateTime
} from '../../../src';

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const LOS_ANGELES = 'America/Los_Angeles';

test('invalid calendar type', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);

  const api = calendarsApi('en');
  let s: string;

  s = api.formatDate(mar11, { datetime: 'full', ca: 'invalid' as CalendarType });
  expect(s).toEqual('Saturday, March 10, 2018 at 11:00:25 PM Pacific Standard Time');
});

test('invalid epoch timestamp', () => {
  const api = calendarsApi('en');
  let s: string;
  let date: ZonedDateTime;

  date = { date: 'foo', zoneId: LOS_ANGELES } as unknown as ZonedDateTime;
  s = api.formatDate(date, { datetime: 'full' });
  expect(s).toEqual('Wednesday, December 31, 1969 at 4:00:00 PM Pacific Standard Time');

  date = { date: { foo: 'bar' }, zoneId: LOS_ANGELES } as unknown as ZonedDateTime;
  s = api.formatDate(date, { datetime: 'full' });
  expect(s).toEqual('Wednesday, December 31, 1969 at 4:00:00 PM Pacific Standard Time');
});

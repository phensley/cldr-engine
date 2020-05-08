import { calendarsApi } from '../../_helpers';

import { ZonedDateTime } from '../../../src';

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const LOS_ANGELES = 'America/Los_Angeles';

test('persian', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);

  const api = calendarsApi('en');
  let s: string;

  s = api.formatDate(mar11, { datetime: 'full', ca: 'persian' });
  expect(s).toEqual('Saturday, Esfand 19, 1396 AP at 11:00:25 PM Pacific Standard Time');

  // Related Gregorian year
  s = api.formatDateRaw(mar11, { pattern: 'r', ca: 'persian' });
  expect(s).toEqual('2018');

  s = api.formatDateRaw(mar11, { pattern: 'rrrrrrrrrr', ca: 'persian' });
  expect(s).toEqual('0000002018');
});

test('persian unicode extension', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const api = calendarsApi('en-u-ca-persian');
  let s: string;

  s = api.formatDate(mar11, { datetime: 'full', ca: 'persian' });
  expect(s).toEqual('Saturday, Esfand 19, 1396 AP at 11:00:25 PM Pacific Standard Time');
});

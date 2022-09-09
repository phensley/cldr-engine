import { calendarsApi } from '../../_helpers';
import { ZonedDateTime } from '../../../src';

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const LOS_ANGELES = 'America/Los_Angeles';

test('japanese', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);

  const api = calendarsApi('en');
  let s: string;

  s = api.formatDate(mar11, { datetime: 'full', ca: 'iso8601' });
  expect(s).toEqual('Saturday, March 10, 2018 at 11:00:25 PM Pacific Standard Time');
});

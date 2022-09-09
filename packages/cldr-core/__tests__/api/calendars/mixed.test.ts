import { calendarsApi } from '../../_helpers';
import { ZonedDateTime } from '../../../src';

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const LOS_ANGELES = 'America/Los_Angeles';

test('mixing standard and skeleton', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  let s: string;

  const api = calendarsApi('en');

  // skeletons are complementary
  s = api.formatDate(mar11, { date: 'short', skeleton: 'hm' });
  expect(s).toEqual('3/10/18, 11:00 PM');

  s = api.formatDate(mar11, { date: 'short', skeleton: 'Hm' });
  expect(s).toEqual('3/10/18, 23:00');

  s = api.formatDate(mar11, { time: 'short', skeleton: 'EyMMMd' });
  expect(s).toEqual('Sat, Mar 10, 2018, 11:00 PM');

  s = api.formatDate(mar11, { time: 'full', skeleton: 'yMd' });
  expect(s).toEqual('3/10/2018, 11:00:25 PM Pacific Standard Time');

  // skeleton conflicts with both date/time, not used

  s = api.formatDate(mar11, { date: 'long', time: 'long', skeleton: 'hm' });
  expect(s).toEqual('March 10, 2018 at 11:00:25 PM PST');

  // skeleton conflicts with date, only time portion used

  s = api.formatDate(mar11, { date: 'full', skeleton: 'yMdhm' });
  expect(s).toEqual('Saturday, March 10, 2018 at 11:00 PM');

  s = api.formatDate(mar11, { date: 'full', skeleton: 'yMdHm' });
  expect(s).toEqual('Saturday, March 10, 2018 at 23:00');

  // skeleton conflicts with time, only date portion used

  s = api.formatDate(mar11, { time: 'short', skeleton: 'yMdhmmsv' });
  expect(s).toEqual('3/10/2018, 11:00 PM');

  s = api.formatDate(mar11, { time: 'short', skeleton: 'EyMMMdHmmmsv' });
  expect(s).toEqual('Sat, Mar 10, 2018, 11:00 PM');
});

import { buildConfig, calendarsApi } from '../_helpers';

test('custom calendars', () => {
  const zoneId = 'America/New_York';
  const cfg = buildConfig({ calendars: ['gregorian'] });
  const api = calendarsApi('en', cfg);
  let s: string;

  s = api.formatDate({ date: new Date(2019, 5, 10, 12, 34, 56), zoneId }, { datetime: 'full' });
  expect(s).toEqual('Monday, June 10, 2019 at 8:34:56 AM Eastern Daylight Time');

  s = api.formatDate({ date: new Date(2019, 5, 10, 12, 34, 56), zoneId }, { datetime: 'full', ca: 'buddhist' });
  expect(s).toEqual('Monday, June 10, 2562 BE at 8:34:56 AM Eastern Daylight Time');

  s = api.formatDate({ date: new Date(2019, 5, 10, 12, 34, 56), zoneId }, { datetime: 'full', ca: 'persian' });
  expect(s).toEqual('Monday, June 10, 2562 BE at 8:34:56 AM Eastern Daylight Time');
});

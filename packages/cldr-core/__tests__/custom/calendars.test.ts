import { calendarsApi } from '../_helpers';

test('custom calendars', () => {
  const zoneId = 'America/New_York';
  const api = calendarsApi('en', { calendars: [] });
  let s: string;

  s = api.formatDate({ date: new Date(2019, 5, 10, 12, 34, 56), zoneId }, { datetime: 'full' });
  expect(s).toEqual('Monday, June 10, 2019 at 8:34:56 AM Eastern Daylight Time');

  // We've omitted all non-gregorian calendars, so all date formatting
  // will use the given calendar's rules but fall back to gregorian
  // patterns, names, etc

  s = api.formatDate({ date: new Date(2019, 5, 10, 12, 34, 56), zoneId }, { datetime: 'full', ca: 'buddhist' });
  expect(s).toEqual('Monday, June 10, 2019 at 8:34:56 AM Eastern Daylight Time');

  s = api.formatDate({ date: new Date(2019, 5, 10, 12, 34, 56), zoneId }, { datetime: 'full', ca: 'persian' });
  expect(s).toEqual('Monday, June 10, 2019 at 8:34:56 AM Eastern Daylight Time');
});

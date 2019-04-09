import { calendarsApi, languageBundle, INTERNALS } from '../../_helpers';

import { CalendarPatterns } from '../../../src/internals/calendars/patterns';

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

test('calendar patterns', () => {
  const bundle = languageBundle('en');
  const api = calendarsApi('en');

  const { schema } = INTERNALS;
  const impl = new CalendarPatterns(bundle, INTERNALS, schema.Buddhist);

  const date = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId: 'America/New_York' });
  const skel = impl.parseSkeleton('y');
  const pattern = impl.getAvailablePattern(date, skel);
  expect(pattern).toEqual([
    ['y', 1],
    ' ',
    ['G', 1]
  ]);
});

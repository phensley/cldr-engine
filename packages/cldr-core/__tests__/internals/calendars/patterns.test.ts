import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarsImpl,
  InternalsImpl,
  PrivateApiImpl
} from '../../../src';

import { CalendarPatterns } from '../../../src/internals/calendars/patterns';

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const INTERNALS = new InternalsImpl();

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);

test('calendar patterns', () => {
  const bundle = languageBundle('en');
  const api = new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));

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

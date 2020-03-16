import { calendarsApi, languageBundle, INTERNALS } from '../../_helpers';

import { CalendarPatterns } from '../../../src/internals/calendars/patterns';
import { DateSkeleton } from '../../../src/internals/calendars/skeleton';

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

test('calendar patterns', () => {
  let skel: DateSkeleton;

  const bundle = languageBundle('en');
  const api = calendarsApi('en');

  const internals = INTERNALS();
  const { schema } = internals;
  const impl = new CalendarPatterns(bundle, internals, schema.Buddhist);

  const date = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId: 'America/New_York' });
  skel = impl.parseSkeleton('y');
  const pattern = impl.getAvailablePattern(date, skel);
  expect(pattern).toEqual([
    ['y', 1],
    ' ',
    ['G', 1]
  ]);

  // Interval matching has minutes resolution
  skel = impl.matchInterval(impl.parseSkeleton('mm'), 's');
  expect(skel.skeleton).toEqual('Hm');
  expect(skel.isTime).toEqual(true);
});

test('edge cases', () => {
  const bundle = languageBundle('en');
  const internals = INTERNALS();
  const impl = new CalendarPatterns(bundle, internals, internals.schema.Buddhist, 3);
  const api = calendarsApi('en');
  const date = api.toGregorianDate({ date: MARCH_11_2018_070025_UTC, zoneId: 'America/New_York' });

  expect(impl.getDatePattern('missing-width')).toEqual([]);
  expect(impl.getTimePattern('missing-width')).toEqual([]);
  expect(impl.getWrapperPattern('missing-width')).toEqual('');

  expect(impl.getAvailablePattern(date, { skeleton: 'xyz' } as DateSkeleton)).toEqual([]);
  expect(impl.getAvailablePattern(date, { pattern: 'foo' } as DateSkeleton)).toEqual(['foo']);

  expect(impl.getIntervalPattern('x', 'xyz')).toEqual([]);
  expect(impl.getIntervalPattern('x', 'yMd')).toEqual([]);
});

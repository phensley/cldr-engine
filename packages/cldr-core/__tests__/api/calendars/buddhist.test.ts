import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarsImpl,
  CalendarDate,
  DateRawFormatOptions,
  InternalsImpl,
  PrivateApiImpl,
  UnixEpochTime
} from '../../../src';

const INTERNALS = new InternalsImpl();

const unix = (epoch: number, zoneId: string): UnixEpochTime => ({ epoch, zoneId });

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

// March 1, 2018 6:45:17 PM UTC
const MARCH_01_2018_184517_UTC = 1519929917000;

// April, 1, 2018 11:23:34 AM UTC
const APRIL_01_2018_112334_UTC = 1522581814000;

const HOUR = 3600000;
const DAY = 86400000;
const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const calendarsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));
};

test('buddhist', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);

  const api = calendarsApi('en');
  let s: string;

  s = api.formatDate(mar11, { datetime: 'full', ca: 'buddhist' });
  expect(s).toEqual('Saturday, March 10, 2561 BE at 11:00:25 PM Pacific Standard Time');

  // April 27, 500 1:38:09 PM
  const fiveh = unix(-46378606911000, LOS_ANGELES);

  // Extended year
  s = api.formatDateRaw(fiveh, { pattern: 'uuuuuuuuuu', ca: 'buddhist' });
  expect(s).toEqual('0000000500');
});

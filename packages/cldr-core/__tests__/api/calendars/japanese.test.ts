import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarDate,
  CalendarsImpl,
  GregorianDate,
  InternalsImpl,
  PrivateApiImpl,
  UnixEpochTime,
  RawDateFormatOptions
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

test('persian', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);

  const api = calendarsApi('en');
  let s: string;

  s = api.formatDate(mar11, { datetime: 'full', ca: 'japanese' });
  expect(s).toEqual('Saturday, March 10, 30 Heisei at 11:00:25 PM Pacific Standard Time');
});

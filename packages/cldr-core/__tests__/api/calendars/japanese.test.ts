import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarsImpl,
  InternalsImpl,
  PrivateApiImpl,
  ZonedDateTime
} from '../../../src';

const INTERNALS = new InternalsImpl();

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

// May 01, 2019 12:00:00 PM UTC
const MAY_01_2019_120000_UTC = 1556712000000;

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

test('japanese', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);

  const api = calendarsApi('en');
  let s: string;

  s = api.formatDate(mar11, { datetime: 'full', ca: 'japanese' });
  expect(s).toEqual('Saturday, March 10, 30 Heisei at 11:00:25 PM Pacific Standard Time');

  const may01 = unix(MAY_01_2019_120000_UTC, NEW_YORK);

  s = api.formatDate(may01, { datetime: 'full', ca: 'japanese' });
  expect(s).toEqual('Wednesday, May 1, 1 Qqqq at 8:00:00 AM Eastern Daylight Time');
});

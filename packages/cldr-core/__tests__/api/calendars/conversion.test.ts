import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarsImpl,
  CalendarDate,
  GregorianDate,
  InternalsImpl,
  PrivateApiImpl,
  ZonedDateTime,
} from '../../../src/';

const INTERNALS = new InternalsImpl();

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

const NEW_YORK = 'America/New_York';
const ROME = 'Europe/Rome';

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const calendarsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));
};

test('javascript date', () => {
  const api = calendarsApi('en');
  let d: GregorianDate;
  let date: Date;

  // 1514810096789 UTC
  date = new Date(2018, 0, 1, 12, 34, 56, 789);
  d = api.toGregorianDate({ date, zoneId: NEW_YORK});
  expect(d.toString()).toEqual('Gregorian 2018-01-01 07:34:56.789 America/New_York');
  expect(d.unixEpoch()).toEqual(1514810096789);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(1);
  expect(d.dayOfMonth()).toEqual(1);
  expect(d.hour()).toEqual(7);
  expect(d.hourOfDay()).toEqual(7);
  expect(d.minute()).toEqual(34);
  expect(d.second()).toEqual(56);
  expect(d.milliseconds()).toEqual(789);

    // -12219333903211 UTC
  // Gregorian cutover Thurs Oct 4, 1582 - Fri Oct 15, 1582
  date = new Date(1582, 9, 14, 12, 34, 56, 789);
  d = api.toGregorianDate({ date, zoneId: ROME });
  expect(d.toString()).toEqual('Gregorian 1582-10-04 13:34:56.789 Europe/Rome');
  expect(d.unixEpoch()).toEqual(-12219333903211);
  expect(d.year()).toEqual(1582);
  expect(d.month()).toEqual(10);
  expect(d.hour()).toEqual(1);
  expect(d.hourOfDay()).toEqual(13);
  expect(d.minute()).toEqual(34);
  expect(d.second()).toEqual(56);
  expect(d.milliseconds()).toEqual(789);

  // -12219247503211 UTC
  date = new Date(1582, 9, 15, 12, 34, 56, 789);
  d = api.toGregorianDate({ date, zoneId: ROME });
  expect(d.toString()).toEqual('Gregorian 1582-10-15 13:34:56.789 Europe/Rome');
  expect(d.unixEpoch()).toEqual(-12219247503211);
  expect(d.year()).toEqual(1582);
  expect(d.month()).toEqual(10);
  expect(d.dayOfMonth()).toEqual(15);
  expect(d.hour()).toEqual(1);
  expect(d.hourOfDay()).toEqual(13);
  expect(d.minute()).toEqual(34);
  expect(d.second()).toEqual(56);
  expect(d.milliseconds()).toEqual(789);
});

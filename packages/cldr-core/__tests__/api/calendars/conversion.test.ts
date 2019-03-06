import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarsImpl,
  CalendarDate,
  GregorianDate,
  InternalsImpl,
  PrivateApiImpl,
  ZonedDateTime,
} from '../../../src';

const INTERNALS = new InternalsImpl();

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

const NEW_YORK = 'America/New_York';
const ROME = 'Europe/Rome';

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const calendarsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));
};

//
// NOTE: the Gregorian epoch tests are modified since they break on Node v10
// when the tests are run in certain local timezones.
// We usually get UTC for a date by using:
//    (date.getTime() - (date.getTimezoneOffset() * 60000))
//
// As of Node v10 we can no longer get UTC precisely using this method since
// the Date.getTimezoneOffset() returns integer minutes but the timestamp is
// corrected inside Date using seconds.

// For example, before 1883 the GMT offset for America/New_York LMT was
// -4:56:02 -- the 2 seconds are truncated by getTimezoneOffset().

const version = Number(process.version.slice(1).split('.')[0]);

test('zoned date time gregorian epoch', () => {
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

  // Skip checking seconds for Node > v8
  if (version <= 8) {
    expect(d.toString()).toEqual('Gregorian 1582-10-04 13:34:56.789 Europe/Rome');
    expect(d.unixEpoch()).toEqual(-12219333903211);
  }
  expect(d.year()).toEqual(1582);
  expect(d.month()).toEqual(10);
  expect(d.hour()).toEqual(1);
  expect(d.hourOfDay()).toEqual(13);
  expect(d.minute()).toEqual(34);
  if (version <= 8) {
    expect(d.second()).toEqual(56);
  }
  expect(d.milliseconds()).toEqual(789);

  // -12219247503211 UTC
  date = new Date(1582, 9, 15, 12, 34, 56, 789);
  d = api.toGregorianDate({ date, zoneId: ROME });

  // Skip checking seconds for Node > v8
  if (version <= 8) {
    expect(d.toString()).toEqual('Gregorian 1582-10-15 13:34:56.789 Europe/Rome');
    expect(d.unixEpoch()).toEqual(-12219247503211);
  }
  expect(d.year()).toEqual(1582);
  expect(d.month()).toEqual(10);
  expect(d.dayOfMonth()).toEqual(15);
  expect(d.hour()).toEqual(1);
  expect(d.hourOfDay()).toEqual(13);
  expect(d.minute()).toEqual(34);
  if (version <= 8) {
    expect(d.second()).toEqual(56);
  }
  expect(d.milliseconds()).toEqual(789);
});

test('bare date', () => {
  const api = calendarsApi('en');
  let d: CalendarDate;

  d = api.toGregorianDate(new Date(2018, 1, 20, 12, 34));
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(2);
  expect(d.dayOfMonth()).toEqual(20);
  expect(d.hour()).toEqual(0);
  expect(d.hourOfDay()).toEqual(12);
  expect(d.minute()).toEqual(34);
  expect(d.second()).toEqual(0);

  d = d.add({ zoneId: NEW_YORK });
  expect(d.hour()).toEqual(7);
  expect(d.hourOfDay()).toEqual(7);
});

test('noop conversions', () => {
  const api = calendarsApi('en');
  let d: CalendarDate;
  let r: CalendarDate;

  d = api.toGregorianDate(new Date(2018, 1, 1));
  r = api.toGregorianDate(d);
  expect(d).toEqual(r);
});

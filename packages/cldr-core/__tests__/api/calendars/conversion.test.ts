import { calendarsApi } from '../../_helpers';

import { CalendarDate, GregorianDate } from '../../../src';

const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const ROME = 'Europe/Rome';

// NOTE: We have two problems using Date for dates way in the past:
//
// 1. The tzdb defines early timezone offsets in LMT (local mean time)
//    and many of these offsets include a seconds component. The JavaScript
//    spec defines getTimezoneOffset() as returning minutes, so we lose
//    this precision.
// 2. Node v8 did not use the LMT offsets in seconds but Node v10 does.
//    This means that we have a problem trying to run tests on Node v10 that
//    depend on the seconds component of the time zone offset.  Consequently
//    we can't accurately construct a UTC timestamp from a Date object for
//    very old dates whose LMT offset has a seconds component.

test('zoned date time gregorian epoch', () => {
  const api = calendarsApi('en');
  let d: GregorianDate;
  let date: Date;

  // 1514828096789 UTC
  date = new Date(2018, 0, 1, 12, 34, 56, 789);
  d = api.toGregorianDate({ date, zoneId: NEW_YORK });
  expect(d.toString()).toEqual('Gregorian 2018-01-01 12:34:56.789 America/New_York');
  expect(d.unixEpoch()).toEqual(1514828096789);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(1);
  expect(d.dayOfMonth()).toEqual(1);
  expect(d.hour()).toEqual(0);
  expect(d.hourOfDay()).toEqual(12);
  expect(d.minute()).toEqual(34);
  expect(d.second()).toEqual(56);
  expect(d.milliseconds()).toEqual(789);

  d = api.toGregorianDate({ date, zoneId: LOS_ANGELES });
  expect(d.toString()).toEqual('Gregorian 2018-01-01 09:34:56.789 America/Los_Angeles');
  expect(d.unixEpoch()).toEqual(1514828096789);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(1);
  expect(d.dayOfMonth()).toEqual(1);
  expect(d.hour()).toEqual(9);
  expect(d.hourOfDay()).toEqual(9);
  expect(d.minute()).toEqual(34);
  expect(d.second()).toEqual(56);
  expect(d.milliseconds()).toEqual(789);

  // -12219333903211 UTC
  // Gregorian cutover Thurs Oct 4, 1582 - Fri Oct 15, 1582
  // date = new Date(1582, 9, 14, 12, 34, 56, 789);

  // NOTE: can't use new Date here, see note at top.
  let utc = -12219333903211;
  d = api.toGregorianDate({ date: utc, zoneId: ROME });

  // Rome's LMT offset is 0:49:56
  expect(d.timeZoneOffset()).toEqual(2996000);

  // Skip checking seconds for Node > v8
  expect(d.toString()).toEqual('Gregorian 1582-10-04 13:24:52.789 Europe/Rome');
  expect(d.unixEpoch()).toEqual(-12219333903211);
  expect(d.year()).toEqual(1582);
  expect(d.month()).toEqual(10);
  expect(d.hour()).toEqual(1);
  expect(d.hourOfDay()).toEqual(13);
  expect(d.minute()).toEqual(24);
  expect(d.second()).toEqual(52);
  expect(d.milliseconds()).toEqual(789);

  // -12219247503211 UTC
  // date = new Date(1582, 9, 15, 12, 34, 56, 789);

  // NOTE: can't use new Date here, see note at top.
  utc = -12219247503211;
  d = api.toGregorianDate({ date: utc, zoneId: ROME });

  // Rome's LMT offset is 0:49:56
  expect(d.timeZoneOffset()).toEqual(2996000);

  // Skip checking seconds for Node > v8
  expect(d.toString()).toEqual('Gregorian 1582-10-15 13:24:52.789 Europe/Rome');
  expect(d.unixEpoch()).toEqual(-12219247503211);
  expect(d.year()).toEqual(1582);
  expect(d.month()).toEqual(10);
  expect(d.dayOfMonth()).toEqual(15);
  expect(d.hour()).toEqual(1);
  expect(d.hourOfDay()).toEqual(13);
  expect(d.minute()).toEqual(24);
  expect(d.second()).toEqual(52);
  expect(d.milliseconds()).toEqual(789);
});

test('bare date', () => {
  const api = calendarsApi('en');
  let d: CalendarDate;

  // Defaults to UTC
  d = api.toGregorianDate(new Date(2018, 1, 20, 12, 34));
  expect(d.unixEpoch()).toEqual(1519148040000);
  expect(d.year()).toEqual(2018);
  expect(d.month()).toEqual(2);
  expect(d.dayOfMonth()).toEqual(20);
  expect(d.hour()).toEqual(5);
  expect(d.hourOfDay()).toEqual(17);
  expect(d.minute()).toEqual(34);
  expect(d.second()).toEqual(0);

  d = d.withZone(NEW_YORK);
  expect(d.hour()).toEqual(0);
  expect(d.hourOfDay()).toEqual(12);
});

test('noop conversions', () => {
  const api = calendarsApi('en');
  let d: CalendarDate;
  let r: CalendarDate;

  d = api.toGregorianDate(new Date(2018, 1, 1));
  r = api.toGregorianDate(d);
  expect(d).toEqual(r);
});

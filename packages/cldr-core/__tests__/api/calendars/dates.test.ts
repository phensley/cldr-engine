import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarsImpl,
  CalendarDate,
  DateRawFormatOptions,
  GregorianDate,
  InternalsImpl,
  PrivateApiImpl,
  UnixEpochTime
} from '../../../src';
import { DayOfWeek } from '../../../src/systems/calendars/fields';

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

const EN = calendarsApi('en-US');
const DE = calendarsApi('de-DE');
const FA = calendarsApi('fa-AF');

test('gregorian dates', () => {
  const base = MARCH_11_2018_070025_UTC;
  let d: CalendarDate;

  d = EN.newGregorianDate(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  d = DE.newGregorianDate(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = FA.newGregorianDate(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SATURDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);
});

test('iso-8601 dates', () => {
  const base = MARCH_11_2018_070025_UTC;
  let d: CalendarDate;

  d = EN.newISO8601Date(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = DE.newISO8601Date(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = FA.newISO8601Date(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);
});

test('japanese dates', () => {
  const base = MARCH_11_2018_070025_UTC;
  let d: CalendarDate;

  d = EN.newJapaneseDate(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  d = DE.newJapaneseDate(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = FA.newJapaneseDate(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SATURDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);
});

test('persian dates', () => {
  const base = MARCH_11_2018_070025_UTC;
  let d: CalendarDate;

  d = EN.newPersianDate(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  d = DE.newPersianDate(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = FA.newPersianDate(base, NEW_YORK);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SATURDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);
});

test('conversions', () => {
  const base = MARCH_11_2018_070025_UTC;
  const orig = EN.newGregorianDate(base, NEW_YORK);
  let d: CalendarDate;

  d = EN.toISO8601Date(orig);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = EN.toJapaneseDate(d);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  d = EN.toPersianDate(d);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  d = EN.toGregorianDate(d);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);
});

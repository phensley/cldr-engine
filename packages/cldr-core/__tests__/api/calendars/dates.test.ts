import { calendarsApi } from '../../_helpers';

import { CalendarDate } from '../../../src';
import { DayOfWeek } from '../../../src/systems/calendars/fields';

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const NEW_YORK = 'America/New_York';

const EN = calendarsApi('en-US');
const DE = calendarsApi('de-DE');
const FA = calendarsApi('fa-AF');

test('buddhist dates', () => {
  const base = MARCH_11_2018_070025_UTC;
  let d: CalendarDate;

  d = EN.toBuddhistDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  expect(d.year()).toEqual(2561);

  d = DE.toBuddhistDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = FA.toBuddhistDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SATURDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);
});

test('gregorian dates', () => {
  const base = MARCH_11_2018_070025_UTC;
  let d: CalendarDate;

  d = EN.toGregorianDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  expect(d.year()).toEqual(2018);

  d = DE.toGregorianDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = FA.toGregorianDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SATURDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);
});

test('iso-8601 dates', () => {
  const base = MARCH_11_2018_070025_UTC;
  let d: CalendarDate;

  d = EN.toISO8601Date({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  expect(d.year()).toEqual(2018);

  d = DE.toISO8601Date({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = FA.toISO8601Date({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);
});

test('japanese dates', () => {
  const base = MARCH_11_2018_070025_UTC;
  let d: CalendarDate;

  d = EN.toJapaneseDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  expect(d.year()).toEqual(30);

  d = DE.toJapaneseDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = FA.toJapaneseDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SATURDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);
});

test('persian dates', () => {
  const base = MARCH_11_2018_070025_UTC;
  let d: CalendarDate;

  d = EN.toPersianDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  expect(d.year()).toEqual(1396);

  d = DE.toPersianDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  d = FA.toPersianDate({ date: base, zoneId: NEW_YORK });
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SATURDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);
});

test('conversions', () => {
  const base = MARCH_11_2018_070025_UTC;
  const orig = EN.toGregorianDate({ date: base, zoneId: NEW_YORK });
  let d: CalendarDate;

  d = EN.toISO8601Date(orig);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.MONDAY);
  expect(d.minDaysInFirstWeek()).toEqual(4);

  expect(d.year()).toEqual(2018);

  d = EN.toJapaneseDate(d);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  expect(d.year()).toEqual(30);
  expect(d.extendedYear()).toEqual(2018);

  d = EN.toPersianDate(d);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  expect(d.year()).toEqual(1396);
  expect(d.extendedYear()).toEqual(1396);

  d = EN.toGregorianDate(d);
  expect(d.firstDayOfWeek()).toEqual(DayOfWeek.SUNDAY);
  expect(d.minDaysInFirstWeek()).toEqual(1);

  expect(d.year()).toEqual(2018);
  expect(d.extendedYear()).toEqual(2018);

  expect(d).toEqual(orig);

  d = EN.toGregorianDate({ date: d.unixEpoch() });
  expect(d.hour()).toEqual(7);
  expect(d.year()).toEqual(2018);
  expect(d.extendedYear()).toEqual(2018);
});

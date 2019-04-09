import { calendarsApi } from '../../_helpers';
import { DateTimePatternFieldType } from '@phensley/cldr-schema';

import {
  CalendarDate,
  ZonedDateTime
} from '../../../src';

const zoned = (date: number | Date, zoneId?: string): ZonedDateTime => ({ date, zoneId });

const NEW_YORK = 'America/New_York';
const LONDON = 'Europe/London';

test('field difference', () => {
  const api = calendarsApi('en');
  let z1: ZonedDateTime;
  let z2: ZonedDateTime;
  let f: DateTimePatternFieldType;

  z1 = zoned(new Date(2018, 0, 1));

  f = api.fieldOfGreatestDifference(z1, z1);
  expect(f).toEqual('s');

  z2 = zoned(new Date(2018, 0, 1, 0, 0, 0, 100));
  f = api.fieldOfGreatestDifference(z1, z2);
  expect(f).toEqual('s');

  z2 = zoned(new Date(2018, 0, 1, 0, 0, 5, 100));
  f = api.fieldOfGreatestDifference(z1, z2);
  expect(f).toEqual('s');

  z2 = zoned(new Date(2018, 0, 1, 0, 10, 0, 0));
  f = api.fieldOfGreatestDifference(z1, z2);
  expect(f).toEqual('m');

  z2 = zoned(new Date(2018, 0, 1, 2, 10, 0, 0));
  f = api.fieldOfGreatestDifference(z1, z2);
  expect(f).toEqual('H');

  z2 = zoned(new Date(2018, 0, 2, 0, 0, 0, 0));
  f = api.fieldOfGreatestDifference(z1, z2);
  expect(f).toEqual('d');

  z2 = zoned(new Date(2018, 1, 16));
  f = api.fieldOfGreatestDifference(z1, z2);
  expect(f).toEqual('M');

  z2 = zoned(new Date(2019, 1, 16));
  f = api.fieldOfGreatestDifference(z1, z2);
  expect(f).toEqual('y');
});

test('field diff mixed zoned and date', () => {
  const api = calendarsApi('en');
  let z: ZonedDateTime;
  let d: CalendarDate;
  let f: DateTimePatternFieldType;

  // Feb 1 midnight UTC is Jan 31 NY time
  z = zoned(new Date(2018, 1, 1), NEW_YORK);

  d = api.toGregorianDate(z);
  f = api.fieldOfGreatestDifference(z, d);
  expect(f).toEqual('s');

  // Jan 15 NY
  d = api.toGregorianDate(zoned(new Date(2018, 0, 15), NEW_YORK));
  f = api.fieldOfGreatestDifference(z, d);
  expect(f).toEqual('d');

  // Feb 2 NY
  d = api.toGregorianDate(zoned(new Date(2018, 1, 2), NEW_YORK));
  f = api.fieldOfGreatestDifference(z, d);
  expect(f).toEqual('M');

  // Feb 1 London
  d = api.toGregorianDate(zoned(new Date(2018, 1, 1), LONDON));
  f = api.fieldOfGreatestDifference(z, d);
  expect(f).toEqual('M');
});

test('field diff mixed date types', () => {
  const api = calendarsApi('en');
  let d1: CalendarDate;
  let d2: CalendarDate;
  let f: DateTimePatternFieldType;

  d1 = api.toGregorianDate(zoned(new Date(2018, 1, 1), NEW_YORK));
  d2 = api.toPersianDate(zoned(new Date(2018, 1, 1), NEW_YORK));
  expect(d1.year()).not.toEqual(d2.year());
  f = api.fieldOfGreatestDifference(d1, d2);
  expect(f).toEqual('s');
});

test('field diff bare date', () => {
  const api = calendarsApi('en');
  let f: DateTimePatternFieldType;

  f = api.fieldOfGreatestDifference(new Date(2018, 5, 1), new Date(2018, 5, 17));
  expect(f).toEqual('d');

  f = api.fieldOfGreatestDifference(new Date(2018, 10), new Date(2019, 10));
  expect(f).toEqual('y');
});

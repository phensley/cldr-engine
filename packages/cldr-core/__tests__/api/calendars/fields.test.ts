import { DateTimePatternFieldType } from '@phensley/cldr-types';
import { calendarsApi } from '../../_helpers';

import { CalendarDate, ZonedDateTime } from '../../../src';

const zoned = (date: number | Date, zoneId?: string): ZonedDateTime => ({ date, zoneId });

const NEW_YORK = 'America/New_York';
const LONDON = 'Europe/London';

test('field difference', () => {
  const api = calendarsApi('en');
  let z1: ZonedDateTime;
  let z2: ZonedDateTime;
  let f: DateTimePatternFieldType | undefined;

  // Zone-less dates are interpreted as UTC wall clock time, so construct the
  // epochs with Date.UTC to keep the test independent of the host timezone.
  z1 = zoned(new Date(Date.UTC(2018, 0, 1)));

  f = api.fieldOfVisualDifference(z1, z1);
  expect(f).toEqual(undefined);

  z2 = zoned(new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 100)));
  f = api.fieldOfVisualDifference(z1, z2);
  expect(f).toEqual(undefined);

  z2 = zoned(new Date(Date.UTC(2018, 0, 1, 0, 0, 5, 100)));
  f = api.fieldOfVisualDifference(z1, z2);
  expect(f).toEqual('s');

  z2 = zoned(new Date(Date.UTC(2018, 0, 1, 0, 10, 0, 0)));
  f = api.fieldOfVisualDifference(z1, z2);
  expect(f).toEqual('m');

  z2 = zoned(new Date(Date.UTC(2018, 0, 1, 2, 10, 0, 0)));
  f = api.fieldOfVisualDifference(z1, z2);
  expect(f).toEqual('H');

  z2 = zoned(new Date(Date.UTC(2018, 0, 2, 0, 0, 0, 0)));
  f = api.fieldOfVisualDifference(z1, z2);
  expect(f).toEqual('d');

  z2 = zoned(new Date(Date.UTC(2018, 1, 16)));
  f = api.fieldOfVisualDifference(z1, z2);
  expect(f).toEqual('M');

  z2 = zoned(new Date(Date.UTC(2019, 1, 16)));
  f = api.fieldOfVisualDifference(z1, z2);
  expect(f).toEqual('y');
});

test('field diff mixed zoned and date', () => {
  const api = calendarsApi('en');
  let z: ZonedDateTime;
  let d: CalendarDate;
  let f: DateTimePatternFieldType | undefined;

  // Jan 31, 2018 10:00 AM EST (UTC-5) == Jan 31, 2018 15:00 UTC
  z = zoned(1517410800000, NEW_YORK);

  d = api.toGregorianDate(z);
  f = api.fieldOfVisualDifference(z, d);
  expect(f).toEqual(undefined);

  // Jan 15, 2018 midnight EST == Jan 15, 2018 05:00 UTC
  d = api.toGregorianDate(zoned(1515992400000, NEW_YORK));
  f = api.fieldOfVisualDifference(z, d);
  expect(f).toEqual('d');

  // Feb 2, 2018 midnight EST == Feb 2, 2018 05:00 UTC
  d = api.toGregorianDate(zoned(1517547600000, NEW_YORK));
  f = api.fieldOfVisualDifference(z, d);
  expect(f).toEqual('M');

  // Feb 1, 2018 midnight GMT == Feb 1, 2018 00:00 UTC
  d = api.toGregorianDate(zoned(1517443200000, LONDON));
  f = api.fieldOfVisualDifference(z, d);
  expect(f).toEqual('M');
});

test('field diff mixed date types', () => {
  const api = calendarsApi('en');
  let d1: CalendarDate;
  let d2: CalendarDate;
  let f: DateTimePatternFieldType | undefined;

  // Feb 1, 2018 midnight EST == Feb 1, 2018 05:00 UTC
  d1 = api.toGregorianDate(zoned(1517443200000, NEW_YORK));
  d2 = api.toPersianDate(zoned(1517443200000, NEW_YORK));
  expect(d1.year()).not.toEqual(d2.year());
  // converts d2 to d1's calendar
  f = api.fieldOfVisualDifference(d1, d2);
  expect(f).toEqual(undefined);
});

test('field diff bare date', () => {
  const api = calendarsApi('en');
  let f: DateTimePatternFieldType | undefined;

  // Zone-less dates are interpreted as UTC wall clock time
  f = api.fieldOfVisualDifference(new Date(Date.UTC(2018, 5, 1)), new Date(Date.UTC(2018, 5, 17)));
  expect(f).toEqual('d');

  f = api.fieldOfVisualDifference(new Date(Date.UTC(2018, 10)), new Date(Date.UTC(2019, 10)));
  expect(f).toEqual('y');
});

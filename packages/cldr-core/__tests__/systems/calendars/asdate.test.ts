import { CalendarDate, GregorianDate } from '../../../src';

test('as javascript date', () => {
  let d: CalendarDate;
  let j: Date;

  // asJSDate() returns a Date for the UTC instant of the zoned wall clock
  // time. Assert on the epoch and UTC fields so the test does not depend on
  // the host timezone.
  d = GregorianDate.fromFields(
    {
      year: 2020,
      month: 4,
      day: 21,
      hour: 12,
      minute: 34,
      second: 56,
      millis: 123,
      zoneId: 'America/New_York',
    },
    1,
    1,
  );

  j = d.asJSDate();
  // April 21, 2020 12:34:56.123 PM EDT (UTC-4) == 16:34:56.123 UTC
  expect(j.getTime()).toEqual(1587486896123);
  expect(j.getUTCFullYear()).toEqual(2020);
  expect(j.getUTCMonth()).toEqual(3);
  expect(j.getUTCDate()).toEqual(21);
  expect(j.getUTCHours()).toEqual(16);
  expect(j.getUTCMinutes()).toEqual(34);
  expect(j.getUTCSeconds()).toEqual(56);
  expect(j.getUTCMilliseconds()).toEqual(123);

  j = d.set({ zoneId: 'America/Los_Angeles' }).asJSDate();
  // April 21, 2020 12:34:56.123 PM PDT (UTC-7) == 19:34:56.123 UTC
  expect(j.getTime()).toEqual(1587497696123);
  expect(j.getUTCFullYear()).toEqual(2020);
  expect(j.getUTCMonth()).toEqual(3);
  expect(j.getUTCDate()).toEqual(21);
  expect(j.getUTCHours()).toEqual(19);
  expect(j.getUTCMinutes()).toEqual(34);
  expect(j.getUTCSeconds()).toEqual(56);
  expect(j.getUTCMilliseconds()).toEqual(123);

  j = d.set({ month: 1 }).asJSDate();
  // January 21, 2020 12:34:56.123 PM EST (UTC-5) == 17:34:56.123 UTC
  expect(j.getTime()).toEqual(1579628096123);
  expect(j.getUTCFullYear()).toEqual(2020);
  expect(j.getUTCMonth()).toEqual(0);
  expect(j.getUTCDate()).toEqual(21);
  expect(j.getUTCHours()).toEqual(17);
  expect(j.getUTCMinutes()).toEqual(34);
  expect(j.getUTCSeconds()).toEqual(56);
  expect(j.getUTCMilliseconds()).toEqual(123);
});

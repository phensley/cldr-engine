import { CalendarDate, GregorianDate } from '../../../src/systems/calendars';

test('as javascript date', () => {
  let d: CalendarDate;
  let j: Date;

  d = GregorianDate.fromFields({
    year: 2020, month: 4, day: 21,
    hour: 12, minute: 34, second: 56, millis: 123,
    zoneId: 'America/New_York'
  }, 1, 1);

  j = d.asJSDate();
  expect(j.getFullYear()).toEqual(2020);
  expect(j.getMonth()).toEqual(3);
  expect(j.getDate()).toEqual(21);
  expect(j.getHours()).toEqual(12);
  expect(j.getMinutes()).toEqual(34);
  expect(j.getSeconds()).toEqual(56);
  expect(j.getMilliseconds()).toEqual(123);
  expect(j.getTimezoneOffset()).toEqual(240);

  j = d.set({ zoneId: 'America/Los_Angeles' }).asJSDate();
  expect(j.getFullYear()).toEqual(2020);
  expect(j.getMonth()).toEqual(3);
  expect(j.getDate()).toEqual(21);
  expect(j.getHours()).toEqual(15);
  expect(j.getMinutes()).toEqual(34);
  expect(j.getSeconds()).toEqual(56);
  expect(j.getMilliseconds()).toEqual(123);
  expect(j.getTimezoneOffset()).toEqual(240);

  j = d.set({ month: 1 }).asJSDate();
  expect(j.getFullYear()).toEqual(2020);
  expect(j.getMonth()).toEqual(0);
  expect(j.getDate()).toEqual(21);
  expect(j.getHours()).toEqual(12);
  expect(j.getMinutes()).toEqual(34);
  expect(j.getSeconds()).toEqual(56);
  expect(j.getMilliseconds()).toEqual(123);
  expect(j.getTimezoneOffset()).toEqual(300);
});

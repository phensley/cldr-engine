import { GregorianDate } from '../../../src/systems/calendars';
import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { NEW_YORK } from './_referencedates';

const make = (e: number, z: string) => GregorianDate.fromUnixEpoch(e, z, DayOfWeek.SUNDAY, 1);

test('weeks coverage', () => {
  let d: GregorianDate;
  let n: number;

  //  December 2020
  //  Su Mo Tu We Th Fr Sa
  //         1  2  3  4  5
  //   6  7  8  9 10 11 12
  //  13 14 15 16 17 18 19
  //  20 21 22 23 24 25 26
  //  27 28 29 30 31

  // Thursday, December 31, 2020 12:30:00 PM UTC
  n = 1609417800000;

  // Dec 31
  d = make(n, NEW_YORK);
  expect(d.weekOfMonth()).toEqual(5);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2021);
  expect(d.weekOfYearISO()).toEqual(53);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  // Dec 30
  d = d.subtract({ day: 1 });
  expect(d.weekOfMonth()).toEqual(5);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2021);
  expect(d.weekOfYearISO()).toEqual(53);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  // Dec 29
  d = d.subtract({ day: 1 });
  expect(d.weekOfMonth()).toEqual(5);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2021);
  expect(d.weekOfYearISO()).toEqual(53);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  // Dec 28
  d = d.subtract({ day: 1 });
  expect(d.weekOfMonth()).toEqual(5);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2021);
  expect(d.weekOfYearISO()).toEqual(53);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  // Dec 27
  d = d.subtract({ day: 1 });
  expect(d.weekOfMonth()).toEqual(5);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2021);
  expect(d.weekOfYearISO()).toEqual(52);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  // Dec 26
  d = d.subtract({ day: 1 });
  expect(d.weekOfMonth()).toEqual(4);
  expect(d.weekOfYear()).toEqual(52);
  expect(d.yearOfWeekOfYear()).toEqual(2020);
  expect(d.weekOfYearISO()).toEqual(52);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  // Dec 25
  d = d.subtract({ day: 1 });
  expect(d.weekOfMonth()).toEqual(4);
  expect(d.weekOfYear()).toEqual(52);
  expect(d.yearOfWeekOfYear()).toEqual(2020);
  expect(d.weekOfYearISO()).toEqual(52);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  //  January 2021
  //  Su Mo Tu We Th Fr Sa
  //                  1  2
  //   3  4  5  6  7  8  9
  //  10 11 12 13 14 15 16
  //  17 18 19 20 21 22 23
  //  24 25 26 27 28 29 30
  //  31

  // Jan 1
  d = make(n, NEW_YORK).add({ day: 1 });
  expect(d.weekOfMonth()).toEqual(1);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2021);
  expect(d.weekOfYearISO()).toEqual(53);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  // Jan 2
  d = d.add({ day: 1 });
  expect(d.weekOfMonth()).toEqual(1);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2021);
  expect(d.weekOfYearISO()).toEqual(53);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  // Jan 3
  d = d.add({ day: 1 });
  expect(d.weekOfMonth()).toEqual(2);
  expect(d.weekOfYear()).toEqual(2);
  expect(d.yearOfWeekOfYear()).toEqual(2021);
  expect(d.weekOfYearISO()).toEqual(53);
  expect(d.yearOfWeekOfYearISO()).toEqual(2020);

  // Jan 4
  d = d.add({ day: 1 });
  expect(d.weekOfMonth()).toEqual(2);
  expect(d.weekOfYear()).toEqual(2);
  expect(d.yearOfWeekOfYear()).toEqual(2021);
  expect(d.weekOfYearISO()).toEqual(1);
  expect(d.yearOfWeekOfYearISO()).toEqual(2021);
});

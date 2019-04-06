import { ISO8601Date } from '../../../src/systems/calendars';

const make = (e: number, z: string) => ISO8601Date.fromUnixEpoch(e, z, -1, -1);

test('iso week', () => {
  const zoneId = 'America/New_York';
  let d: ISO8601Date;

  // Sat, Mar 11, 2000
  d = make(952761625000, zoneId);
  expect(d.dayOfWeek()).toEqual(7); // saturday
  expect(d.weekOfYear()).toEqual(10);
  expect(d.yearOfWeekOfYear()).toEqual(2000);
  expect(d.isLeapYear()).toEqual(true);

  // Tue, Dec 28, 2004
  d = make(1104238984000, zoneId);
  expect(d.toString()).toEqual('ISO8601 2004-12-28 08:03:04.000 America/New_York');
  expect(d.weekOfYear()).toEqual(53);
  expect(d.yearOfWeekOfYear()).toEqual(2004);
  expect(d.isLeapYear()).toEqual(true);

  // Sat, Jan 1, 2005
  d = make(1104580800000, zoneId);
  expect(d.weekOfYear()).toEqual(53);
  expect(d.yearOfWeekOfYear()).toEqual(2004);
  expect(d.isLeapYear()).toEqual(false);

  // Mon, Dec 31, 2007
  d = make(1199106184000, zoneId);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2008);

  // Fri, Sep 26, 2008
  d = make(1222430400000, zoneId);
  expect(d.weekOfYear()).toEqual(39);
  expect(d.yearOfWeekOfYear()).toEqual(2008);

  // Mon, Dec 29, 2008
  d = make(1230555784000, zoneId);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2009);

  // Sun, Jan 1, 2017
  d = make(1483275784000, zoneId);
  expect(d.weekOfYear()).toEqual(52);
  expect(d.yearOfWeekOfYear()).toEqual(2016);

  // Mon, Jan 2, 2017
  d = make(1483362184000, zoneId);
  expect(d.weekOfYear()).toEqual(1);
  expect(d.yearOfWeekOfYear()).toEqual(2017);

  // Thu, Dec 28, 2017
  d = make(1514465667000, zoneId);
  expect(d.weekOfYear()).toEqual(52);
  expect(d.yearOfWeekOfYear()).toEqual(2017);

  // Sun, Mar 11, 2018
  d = make(1520751625000, zoneId);
  expect(d.weekOfYear()).toEqual(10);
  expect(d.yearOfWeekOfYear()).toEqual(2018);
});

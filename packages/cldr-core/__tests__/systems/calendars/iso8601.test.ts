import { DayOfWeek } from '../../../src/systems/calendars/fields';
import { CalendarDate, CalendarType, GregorianDate, ISO8601Date } from '../../../src/systems/calendars';
import { CalendarConstants } from '../../../src/systems/calendars/constants';

const make = (e: number, z: string) => ISO8601Date.fromUnixEpoch(e, z, -1, -1);

test('iso week', () => {
  const zoneId = 'America/New_York';

  // Tue, Dec 28, 2004
  let date = make(1104238984000, zoneId);
  expect(date.toString()).toEqual('ISO8601Date(epoch=1104238984000, zone=America/New_York)');
  expect(date.weekOfYear()).toEqual(53);
  expect(date.yearOfWeekOfYear()).toEqual(2004);

  // Sat, Jan 1, 2005
  date = make(1104580800000, zoneId);
  expect(date.weekOfYear()).toEqual(53);
  expect(date.yearOfWeekOfYear()).toEqual(2004);

  // Mon, Dec 31, 2007
  date = make(1199106184000, zoneId);
  expect(date.weekOfYear()).toEqual(1);
  expect(date.yearOfWeekOfYear()).toEqual(2008);

  // Fri, Sep 26, 2008
  date = make(1222430400000, zoneId);
  expect(date.weekOfYear()).toEqual(39);
  expect(date.yearOfWeekOfYear()).toEqual(2008);

  // Mon, Dec 29, 2008
  date = make(1230555784000, zoneId);
  expect(date.weekOfYear()).toEqual(1);
  expect(date.yearOfWeekOfYear()).toEqual(2009);

  // Sun, Jan 1, 2017
  date = make(1483275784000, zoneId);
  expect(date.weekOfYear()).toEqual(52);
  expect(date.yearOfWeekOfYear()).toEqual(2016);

  // Mon, Jan 2, 2017
  date = make(1483362184000, zoneId);
  expect(date.weekOfYear()).toEqual(1);
  expect(date.yearOfWeekOfYear()).toEqual(2017);

  // Thu, Dec 28, 2017
  date = make(1514465667000, zoneId);
  expect(date.weekOfYear()).toEqual(52);
  expect(date.yearOfWeekOfYear()).toEqual(2017);

  // Sun, Mar 11, 2018
  date = make(1520751625000, zoneId);
  expect(date.weekOfYear()).toEqual(10);
  expect(date.yearOfWeekOfYear()).toEqual(2018);
});

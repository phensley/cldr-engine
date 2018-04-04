import { ZonedDateTime } from '../../../src/types/datetime';

const make = (epoch: number | Date, zoneId: string) => new ZonedDateTime(epoch, zoneId);

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const NEW_YORK = 'America/New_York';
const DAY = 86400000;

test('iso week', () => {
  const zoneId = 'America/New_York';

  // Tue, Dec 28, 2004
  let date = make(1104238984000, zoneId);
  expect(date.getISOWeek()).toEqual(53);
  expect(date.getISOYear()).toEqual(2004);

  // Sat, Jan 1, 2005
  date = make(1104580800000, zoneId);
  expect(date.getISOWeek()).toEqual(53);
  expect(date.getISOYear()).toEqual(2004);

  // Mon, Dec 31, 2007
  date = make(1199106184000, zoneId);
  expect(date.getISOWeek()).toEqual(1);
  expect(date.getISOYear()).toEqual(2008);

  // Fri, Sep 26, 2008
  date = make(1222430400000, zoneId);
  expect(date.getISOWeek()).toEqual(39);
  expect(date.getISOYear()).toEqual(2008);

  // Mon, Dec 29, 2008
  date = make(1230555784000, zoneId);
  expect(date.getISOWeek()).toEqual(1);
  expect(date.getISOYear()).toEqual(2009);

  // Sun, Jan 1, 2017
  date = make(1483275784000, zoneId);
  expect(date.getISOWeek()).toEqual(52);
  expect(date.getISOYear()).toEqual(2016);

  // Mon, Jan 2, 2017
  date = make(1483362184000, zoneId);
  expect(date.getISOWeek()).toEqual(1);
  expect(date.getISOYear()).toEqual(2017);

  // Thu, Dec 28, 2017
  date = make(1514465667000, zoneId);
  expect(date.getISOWeek()).toEqual(52);
  expect(date.getISOYear()).toEqual(2017);

  // Sun, Mar 11, 2018
  date = make(1520751625000, zoneId);
  expect(date.getISOWeek()).toEqual(10);
  expect(date.getISOYear()).toEqual(2018);
});

test('iso week string', () => {
  let d: ZonedDateTime;
  const base = MARCH_11_2018_070025_UTC;

  d = make(base, NEW_YORK);
  expect(d.getDayOfYear()).toEqual(70);
  expect(d.getISOWeekString(true)).toEqual('2018W107');
  expect(d.getISOWeekString()).toEqual('2018-W10-7');

  d = make(base + (10 * DAY), NEW_YORK);
  expect(d.getDayOfYear()).toEqual(80);
  expect(d.getISOWeekString(true)).toEqual('2018W123');
  expect(d.getISOWeekString()).toEqual('2018-W12-3');

  d = make(base + (90 * DAY), NEW_YORK);
  expect(d.getDayOfYear()).toEqual(160);
  expect(d.getISOWeekString(true)).toEqual('2018W236');
  expect(d.getISOWeekString()).toEqual('2018-W23-6');
});

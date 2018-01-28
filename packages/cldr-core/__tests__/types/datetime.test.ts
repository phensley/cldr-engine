import { ZonedDateTime } from '../../src/types/datetime';

const make = (epoch: number | Date, zoneId: string) => new ZonedDateTime(epoch, zoneId);

test('america/new york', () => {
  const zoneId = 'America/New_York';

  // Thu, Jun 3, 2004 22:00:00 UTC
  // Thu, Jun 3, 2004 18:00:00 EDT (UTC-4)
  let epoch = 1086300000000;
  let date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(true);
  expect(date.timezoneOffset()).toEqual(240);

  // Sun, Oct 31, 2004 05:55:00 UTC
  // Sun, Oct 31, 2004 01:55:00 EDT (UTC-4)
  epoch = 1099202100000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(true);
  expect(date.timezoneOffset()).toEqual(240);

  // Sun, Oct 31, 2004 06:06:40 UTC
  // Sun, Oct 31, 2004 01:06:40 EST (UTC-5)
  epoch = 1099202800000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(false);
  expect(date.timezoneOffset()).toEqual(300);

  // Wed, Jan 24, 2018 03:13:55 UTC
  // Wed, Jan 23, 2018 22:13:55 EST (UTC-5)
  epoch = 1516763635000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(false);
  expect(date.timezoneOffset()).toEqual(300);

  // Sun, Mar 11, 2018 01:15:25 UTC
  // Sun, Mar 10, 2018 20:15:25 EST (UTC-5)
  epoch = 1520730925000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(false);
  expect(date.timezoneOffset()).toEqual(300);

  // Sun, Mar, 11, 2018 07:00:25 UTC
  // Sun, Mar, 11, 2018 03:00:25 EDT (UTC-4)
  epoch = 1520751625000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(true);
  expect(date.timezoneOffset()).toEqual(240);

  // TODO: november 2018
});

test('iso week of week year', () => {
  // Fri, Sep 26, 2008 12:00:00 UTC
  let date = new ZonedDateTime(1222430400000, 'America/New_York');
  expect(date.getDayOfYear()).toEqual(270);
  expect(date.getDayOfWeek()).toEqual(5);

  // TODO:
  // expect(date.getISOWeekOfWeekYear()).toEqual(39);

  date = new ZonedDateTime(1104580800000, 'America/New_York');
  // console.log(date.getISOWeekOfWeekYear());
});

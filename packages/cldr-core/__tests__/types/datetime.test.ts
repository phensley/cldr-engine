import { ZonedDateTime } from '../../src/types/datetime';

const make = (epoch: number | Date, zoneId: string) => new ZonedDateTime(epoch, zoneId);

test('metazones, dst, offsets', () => {
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

test('metazone ids', () => {
  // Uses 3 different metazones.
  // See https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/metaZones.json#L495
  const zoneId = 'Africa/Windhoek';

  // Tuesday, January 19, 2100 12:00:00 AM UTC
  let epoch = 4104000000;
  let date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Southern');

  // Tuesday, March 20, 1990 9:00:00 PM UTC
  epoch = 637966800000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Southern');

  // 1 hour later, switch metazone ids
  epoch += 3600000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Central');

  // Sunday, March 20, 1994 9:00:00 PM UTC
  epoch = 764197200000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Central');

  // 1 hour later, switch metazone ids
  epoch += 3600000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Western');

  // Sunday, September 3, 2017 12:30:00 AM UTC
  epoch = 1504398600000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Western');

  // 30 minutes later, switch metazone ids
  epoch += 1800000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Central');

  // Tuesday, September 3, 2019 12:30:00 AM UTC
  epoch = 1567470600000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Central');
});

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

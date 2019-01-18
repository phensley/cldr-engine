import { GregorianDate } from '../../../src';

const make = (epoch: number | Date, zoneId: string): GregorianDate =>
  GregorianDate.fromUnixEpoch(+epoch, zoneId, 1, 1);

test('metazones, dst, offsets', () => {
  const zoneId = 'America/New_York';

  // Thu, Jun 3, 2004 22:00:00 UTC
  // Thu, Jun 3, 2004 18:00:00 EDT (UTC-4)
  let epoch = 1086300000000;
  let date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(true);
  expect(date.timeZoneOffset() / 60000).toEqual(240);

  // Sun, Oct 31, 2004 05:55:00 UTC
  // Sun, Oct 31, 2004 01:55:00 EDT (UTC-4)
  epoch = 1099202100000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(true);
  expect(date.timeZoneOffset() / 60000).toEqual(240);

  // Sun, Oct 31, 2004 06:06:40 UTC
  // Sun, Oct 31, 2004 01:06:40 EST (UTC-5)
  epoch = 1099202800000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(false);
  expect(date.timeZoneOffset() / 60000).toEqual(300);

  // Wed, Jan 24, 2018 03:13:55 UTC
  // Wed, Jan 23, 2018 22:13:55 EST (UTC-5)
  epoch = 1516763635000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(false);
  expect(date.timeZoneOffset() / 60000).toEqual(300);

  // Sun, Mar 11, 2018 01:15:25 UTC
  // Sun, Mar 10, 2018 20:15:25 EST (UTC-5)
  epoch = 1520730925000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(false);
  expect(date.timeZoneOffset() / 60000).toEqual(300);

  // Sun, Mar, 11, 2018 07:00:25 UTC
  // Sun, Mar, 11, 2018 03:00:25 EDT (UTC-4)
  epoch = 1520751625000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('America_Eastern');
  expect(date.isDaylightSavings()).toEqual(true);
  expect(date.timeZoneOffset() / 60000).toEqual(240);

  // TODO: november 2018
});

test('metazone ids', () => {
  // Uses 3 different metazones.
  // See https://github.com/unicode-cldr/cldr-core/blob/34.0.0/supplemental/metaZones.json#L502
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

  // Sunday, October 23, 2017 21:30:00 PM UTC
  epoch = 1508794200000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Western');

  // 30 minutes later, switch metazone ids
  epoch += 1800000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Central');

  // Tuesday, October 23, 2019 22:30:00 AM UTC
  epoch = 1571869800000;
  date = make(epoch, zoneId);
  expect(date.metaZoneId()).toEqual('Africa_Central');
});

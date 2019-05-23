import { zoneInfoFromUTC } from '../../../src/systems/calendars/timezone';

test('zone info', () => {
  const utc = 1554263155000;
  let info = zoneInfoFromUTC('America/New_York', utc);
  expect(info.abbr).toEqual('EDT');
  expect(info.dst).toEqual(1);
  expect(info.metazoneid).toEqual('America_Eastern');
  expect(info.offset).toEqual(-14400000);

  info = zoneInfoFromUTC('Etc/GMT+1', utc);
  expect(info.abbr).toEqual('-01');
  expect(info.dst).toEqual(0);
  expect(info.metazoneid).toEqual('');
  expect(info.offset).toEqual(-3600000);

  info = zoneInfoFromUTC('MissingZone', utc);
  expect(info.abbr).toEqual('UTC');
  expect(info.dst).toEqual(0);
  expect(info.metazoneid).toEqual('GMT');
  expect(info.offset).toEqual(0);
});

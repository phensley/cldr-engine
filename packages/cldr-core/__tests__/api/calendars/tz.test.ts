import { calendarsApi } from '../../_helpers';
import { ZoneInfo } from '../../../lib';

const EN = calendarsApi('en-US');
const MINUTE = 60000;

test('tz info from utc', () => {
  let info: ZoneInfo | undefined;

  const zoneid = 'America/New_York';

  // Mar 10, 2019 06:59:30 AM UTC
  const epoch = 1552201170000;

  info = EN.timeZoneFromUTC(epoch, zoneid);
  expect(info).toEqual({ zoneid, abbr: 'EST', dst: 0, offset: -18000000 });

  info = EN.timeZoneFromUTC(epoch + (30 * MINUTE), zoneid);
  expect(info).toEqual({ zoneid, abbr: 'EDT', dst: 1, offset: -14400000 });
});

test('tz info from wall', () => {
  let info: [number, ZoneInfo] | undefined;

  const zoneid = 'America/New_York';

  // Mar 8 2020 01:00:00 AM
  const epoch = 1583629200000;

  info = EN.timeZoneFromWall(epoch, zoneid);
  expect(info).toEqual([
    1583647200000, // Sun Mar 8 2020 6:00 AM UTC
    { zoneid, abbr: 'EST', dst: 0, offset: -18000000 }
  ]);

  info = EN.timeZoneFromWall(epoch + (60 * MINUTE), zoneid);
  expect(info).toEqual([
    1583650800000, // Sun Mar 8 2020 7:00 AM UTC
    { zoneid, abbr: 'EDT', dst: 1, offset: -14400000 }
  ]);
});

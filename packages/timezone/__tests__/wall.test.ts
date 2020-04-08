import { Timestamp } from './_helpers';
import { TZ, ZoneInfo } from '../src';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/*

Sun Mar 8 2020:

  1583629200000  01:00 AM
  1583632740000  01:59 AM

  1583632800000  02:00 AM
  1583632860000  02:01 AM
  1583636340000  02:59 AM

  1583636400000  03:00 AM
  1583639940000  03:59 AM

  1583640000000  04:00 AM

  1583647200000  06:00 AM
  1583650740000  06:59 AM

  1583650800000  07:00 AM
  1583650860000  07:01 AM
  1583654340000  07:59 AM

  1583654400000  08:00 AM

Sun Mar 29 2020:

  1585443600000  01:00 AM
  1585447140000  01:59 AM

  1585447200000  02:00 AM
  1585447260000  02:01 AM
  1585450740000  02:59 AM

  1585450800000  03:00 AM
  1585454340000  03:59 AM

  1585458000000  05:00 AM
  1585461540000  05:59 AM

  1585461600000  06:00 AM

Sun Oct 25 2020:

  1603587600000  01:00 AM

Sun Nov 1 2020:

  1604192400000  01:00 AM
  1604195940000  01:59 AM

  1604196000000  02:00 AM
  1604196060000  02:01 AM
  1604197800000  02:30 AM
  1604199540000  02:59 AM

  1604199600000  03:00 AM
  1604203140000  03:59 AM

  1604206800000  05:00 AM
  1604210340000  05:59 AM

  1604214000000  07:00 AM
  1604214060000  07:01 AM
  1604215800000  07:30 AM
  1604217540000  07:59 AM

  1604217600000  08:00 AM
  1604221140000  08:59 AM

*/

test('new york spring', () => {
  const zone = 'America/New_York';
  let u: number;
  let z: ZoneInfo;

  // Sun Mar 8 2020 local 2:00 - 2:59 AM don't exist

  // 1:00 AM  ->  1:00 AM
  [u, z] = TZ.fromWall(zone, 1583629200000)!;
  expect(u).toEqual(1583647200000); // Sun Mar 8 2020 6:00 AM UTC
  expect(z.offset).toEqual(-5 * HOUR);
  expect(z.dst).toEqual(0);

  // 1:59 AM  ->  1:59 AM
  [u, z] = TZ.fromWall(zone, 1583632740000)!;
  expect(u).toEqual(1583650740000); // Sun Mar 8 2020 6:59 AM UTC
  expect(z.offset).toEqual(-5 * HOUR);
  expect(z.dst).toEqual(0);

  // TRANSITION FROM -05 to -04

  // 2:00 AM  ->  3:00 AM
  [u, z] = TZ.fromWall(zone, 1583632800000)!;
  expect(u).toEqual(1583650800000); // Sun Mar 8 2020 7:00 AM UTC
  expect(z.offset).toEqual(-4 * HOUR);
  expect(z.dst).toEqual(1);

  // 2:01 AM  ->  3:01 AM
  [u, z] = TZ.fromWall(zone, 1583632860000)!;
  expect(u).toEqual(1583650860000); // Sun Mar 8 2020 7:01 AM UTC
  expect(z.offset).toEqual(-4 * HOUR);
  expect(z.dst).toEqual(1);

  // 2:59 AM  ->  3:59 AM
  [u, z] = TZ.fromWall(zone, 1583636340000)!;
  expect(u).toEqual(1583654340000); // Sun Mar 8 2020 7:59 AM UTC
  expect(z.offset).toEqual(-4 * HOUR);
  expect(z.dst).toEqual(1);

  // 3:00 AM  ->  3:00 AM
  [u, z] = TZ.fromWall(zone, 1583636400000)!;
  expect(u).toEqual(1583650800000); // Sun Mar 8 2020 7:00 AM UTC
  expect(z.offset).toEqual(-4 * HOUR);
  expect(z.dst).toEqual(1);

  // 3:59 AM  ->  3:59 AM
  [u, z] = TZ.fromWall(zone, 1583639940000)!;
  expect(u).toEqual(1583654340000); // Sun Mar 8 2020 7:59 AM UTC
  expect(z.offset).toEqual(-4 * HOUR);
  expect(z.dst).toEqual(1);

  // 4:00 AM  ->  4:00 AM
  [u, z] = TZ.fromWall(zone, 1583640000000)!;
  expect(u).toEqual(1583654400000); // Sun Mar 8 2020 8:00 AM UTC
  expect(z.offset).toEqual(-4 * HOUR);
  expect(z.dst).toEqual(1);
});

test('new york fall', () => {
  const zone = 'America/New_York';
  let u: number;
  let z: ZoneInfo;

  // Sun Nov 1 2020 local 2:00 - 2:59 AM occur twice

  // 1:00 AM  ->  1:00 AM
  [u, z] = TZ.fromWall(zone, 1604192400000)!;
  expect(u).toEqual(1604206800000); // Sun Nov 1 2020 5:00 AM UTC
  expect(z.offset).toEqual(-4 * HOUR);
  expect(z.dst).toEqual(1);

  // 1:59 AM  ->  1:59 AM
  [u, z] = TZ.fromWall(zone, 1604195940000)!;
  expect(u).toEqual(1604210340000); // Sun Nov 1 2020 5:59 AM UTC
  expect(z.offset).toEqual(-4 * HOUR);
  expect(z.dst).toEqual(1);

  // TRANSITION FROM -04 to -05

  // 2:00 AM  ->  2:00 AM
  [u, z] = TZ.fromWall(zone, 1604196000000)!;
  expect(u).toEqual(1604214000000); // Sun Nov 1 2020 7:00 AM UTC
  expect(z.offset).toEqual(-5 * HOUR);
  expect(z.dst).toEqual(0);

  // 2:01 AM  ->  2:01 AM
  [u, z] = TZ.fromWall(zone, 1604196060000)!;
  expect(u).toEqual(1604214060000); // Sun Nov 1 2020 7:01 AM UTC
  expect(z.offset).toEqual(-5 * HOUR);
  expect(z.dst).toEqual(0);

  // 2:30 AM  ->  2:30 AM
  [u, z] = TZ.fromWall(zone, 1604197800000)!;
  expect(u).toEqual(1604215800000); // Sun Nov 1 2020 7:30 AM UTC
  expect(z.offset).toEqual(-5 * HOUR);
  expect(z.dst).toEqual(0);

  // 2:59 AM  ->  2:59 AM
  [u, z] = TZ.fromWall(zone, 1604199540000)!;
  expect(u).toEqual(1604217540000); // Sun Nov 1 2020 7:59 AM UTC
  expect(z.offset).toEqual(-5 * HOUR);
  expect(z.dst).toEqual(0);

  // 3:00 AM  ->  3:00 AM
  [u, z] = TZ.fromWall(zone, 1604199600000)!;
  expect(u).toEqual(1604217600000); // Sun Nov 1 2020 8:00 AM UTC
  expect(z.offset).toEqual(-5 * HOUR);
  expect(z.dst).toEqual(0);

  // 3:59 AM  -> 3:59 AM
  [u, z] = TZ.fromWall(zone, 1604203140000)!;
  expect(u).toEqual(1604221140000); // Sun Nov 1 2020 8:59 AM UTC
  expect(z.offset).toEqual(-5 * HOUR);
  expect(z.dst).toEqual(0);
});

test('new york off edge of untils', () => {
  const zone = 'America/New_York';
  let t: Timestamp;
  let r: [number, ZoneInfo];

  // Sunday, January 1, 1882 1:59:00 AM local
  t = new Timestamp(-2776975260000);
  r = TZ.fromWall(zone, t.n)!;
  expect(r[1].abbr).toEqual('LMT');
  expect(r[1].offset).toEqual(-17762000);
  expect(r[1].dst).toEqual(0);

  // Sunday, May 18, 2121 1:34:20 AM local
  t = new Timestamp(4776975260000);
  r = TZ.fromWall(zone, t.n)!;
  expect(r[1].abbr).toEqual('EST');
  expect(r[1].dst).toEqual(0);
});

test('berlin spring', () => {
  const zone = 'Europe/Berlin';
  let u: number;
  let z: ZoneInfo;

  // Sun Mar 29 local 2:00 - 2:59 AM don't exist

  // 1:00 AM  ->  1:00 AM
  [u, z] = TZ.fromWall(zone, 1585443600000)!;
  expect(u).toEqual(1585440000000); // Sun Mar 29 12:00 AM UTC
  expect(z.offset).toEqual(1 * HOUR);
  expect(z.dst).toEqual(0);

  // 1:59 AM  ->  1:59 AM
  [u, z] = TZ.fromWall(zone, 1585447140000)!;
  expect(u).toEqual(1585443540000); // Sun Mar 29 12:59 AM UTC
  expect(z.offset).toEqual(1 * HOUR);
  expect(z.dst).toEqual(0);

  // TRANSITION FROM +01 to +02

  // 2:00 AM  ->  3:00 AM
  [u, z] = TZ.fromWall(zone, 1585447200000)!;
  expect(u).toEqual(1585443600000); // Sun Mar 29 01:00 AM UTC
  expect(z.offset).toEqual(2 * HOUR);
  expect(z.dst).toEqual(1);

  // 2:01 AM  ->  3:01 AM
  [u, z] = TZ.fromWall(zone, 1585447260000)!;
  expect(u).toEqual(1585443660000); // Sun Mar 29 01:01 AM UTC
  expect(z.offset).toEqual(2 * HOUR);
  expect(z.dst).toEqual(1);

  // 2:59 AM  ->  3:59 AM
  [u, z] = TZ.fromWall(zone, 1585450740000)!;
  expect(u).toEqual(1585447140000); // Sun Mar 29 01:59 AM UTC
  expect(z.offset).toEqual(2 * HOUR);
  expect(z.dst).toEqual(1);

  // 03:00 AM  ->  3:00 AM
  [u, z] = TZ.fromWall(zone, 1585450800000)!;
  expect(u).toEqual(1585443600000); // Sun Mar 29 01:00 AM UTC
  expect(z.offset).toEqual(2 * HOUR);
  expect(z.dst).toEqual(1);
});

test('berlin fall', () => {
  const zone = 'Europe/Berlin';
  let u: number;
  let z: ZoneInfo;

  // Sun Oct 25 local 2:00 - 2:59 AM occur twice

  // 1:00 AM  ->  1:00 AM
  [u, z] = TZ.fromWall(zone, 1603587600000)!;
  expect(u).toEqual(1603580400000); // Sun Mar 29 11:00 PM UTC
  expect(z.offset).toEqual(2 * HOUR);
  expect(z.dst).toEqual(1);

  // 1:59 AM  ->  1:59 AM
  [u, z] = TZ.fromWall(zone, 1603591140000)!;
  expect(u).toEqual(1603583940000); // Sun Mar 29 11:59 PM UTC
  expect(z.offset).toEqual(2 * HOUR);
  expect(z.dst).toEqual(1);

  // 2:00 AM  ->  02:00 AM
  [u, z] = TZ.fromWall(zone, 1603591200000)!;
  expect(u).toEqual(1603584000000); // Sun Mar 29 12:00 AM UTC
  expect(z.offset).toEqual(2 * HOUR);
  expect(z.dst).toEqual(1);

  // 2:59 AM  ->  02:59 AM
  [u, z] = TZ.fromWall(zone, 1603594740000)!;
  expect(u).toEqual(1603587540000); // Sun Mar 29 12:59 AM UTC
  expect(z.offset).toEqual(2 * HOUR);
  expect(z.dst).toEqual(1);

  // TRANSITION +02 to +01

  // 3:00 AM  ->  03:00 AM
  [u, z] = TZ.fromWall(zone, 1603594800000)!;
  expect(u).toEqual(1603591200000); // Sun Mar 29 02:00 AM UTC
  expect(z.offset).toEqual(1 * HOUR);
  expect(z.dst).toEqual(0);

  // 3:01 AM  ->  03:01 AM
  [u, z] = TZ.fromWall(zone, 1603594860000)!;
  expect(u).toEqual(1603591260000); // Sun Mar 29 02:01 AM UTC
  expect(z.offset).toEqual(1 * HOUR);
  expect(z.dst).toEqual(0);

  // 3:59 AM  ->  03:59 AM
  [u, z] = TZ.fromWall(zone, 1603598340000)!;
  expect(u).toEqual(1603594740000); // Sun Mar 29 02:59 AM UTC
  expect(z.offset).toEqual(1 * HOUR);
  expect(z.dst).toEqual(0);

  // 4:00 AM  ->  04:00 AM
  [u, z] = TZ.fromWall(zone, 1603598400000)!;
  expect(u).toEqual(1603594800000); // Sun Mar 29 03:00 AM UTC
  expect(z.offset).toEqual(1 * HOUR);
  expect(z.dst).toEqual(0);
});

import { Timestamp } from './_helpers';
import { TZ, ZoneInfo } from '../src';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

interface Testcase {
  utc?: number;
  offset: number;
  dst: number;
}

/**
 * Get the timezone offset at the UTC timestamp + time zone, and compare to the
 * expected values.
 */
const forward = (utc: number, zone: string, c: Testcase) => {
  let u: number;
  let z: ZoneInfo;

  const t = new Timestamp(utc);
  z = TZ.fromUTC(zone, t.n)!;

  // Convert utc + offset to wall clock time
  const w = new Timestamp(utc + z.offset);

  [u, z] = TZ.fromWall(zone, w.n)!;
  expect(u).toEqual(c.utc || utc);
  expect(z.offset).toEqual(c.offset * HOUR);
  expect(z.dst).toEqual(c.dst);
};

const backward = (utc: number, zone: string, c: [Testcase, Testcase]) => {
  let u: number;
  let z: ZoneInfo;

  const t = new Timestamp(utc);
  z = TZ.fromUTC(zone, t.n)!;

  // Convert utc + offset to wall clock time
  const w = new Timestamp(utc + z.offset);

  // Compare pre-DST boundary option
  [u, z] = TZ.fromWall(zone, w.n, true)!;
  expect(u).toEqual(c[0].utc);
  expect(z.offset).toEqual(c[0].offset * HOUR);
  expect(z.dst).toEqual(c[0].dst);

  // Compare post-DST boundary option
  [u, z] = TZ.fromWall(zone, w.n, false)!;
  expect(u).toEqual(c[1].utc);
  expect(z.offset).toEqual(c[1].offset * HOUR);
  expect(z.dst).toEqual(c[1].dst);
};

test('new york spring', () => {
  const zone = 'America/New_York';
  let t: Timestamp;

  // Sun Mar 08 2020 07:00:00 AM UTC
  t = new Timestamp(1583650800000);
  forward(t.mins(-120).n, zone, { offset: -5, dst: 0 });
  forward(t.mins(-30).n, zone, { offset: -5, dst: 0 });
  forward(t.mins(-1).n, zone, { offset: -5, dst: 0 });
  forward(t.n, zone, { offset: -4, dst: 1 });
  forward(t.mins(1).n, zone, { offset: -4, dst: 1 });
  forward(t.mins(30).n, zone, { offset: -4, dst: 1 });
  forward(t.mins(120).n, zone, { offset: -4, dst: 1 });
});

test('new york fall', () => {
  const zone = 'America/New_York';
  let t: Timestamp;

  // When clocks are set back in NY there is a 1 hour gap containing
  // ambiguous times that occur twice. We allow the user to specify
  // whether they want the pre- or post-DST offset when the wall
  // clock time falls within the gap.

  // Sun Nov 01 2020 06:00:00 AM UTC
  t = new Timestamp(1604210400000);

  backward(t.mins(-120).n, zone, [
    { offset: -4, dst: 1, utc: t.mins(-120).n },
    { offset: -4, dst: 1, utc: t.mins(-120).n }
  ]);
  backward(t.mins(-60).n, zone, [
    { offset: -4, dst: 1, utc: t.mins(-60).n },
    { offset: -5, dst: 0, utc: t.mins(0).n }
  ]);
  backward(t.mins(-1).n, zone, [
    { offset: -4, dst: 1, utc: t.mins(-1).n },
    { offset: -5, dst: 0, utc: t.mins(59).n }
  ]);
  backward(t.n, zone, [
    { offset: -4, dst: 1, utc: t.mins(-60).n },
    { offset: -5, dst: 0, utc: t.n }
  ]);
  backward(t.mins(1).n, zone, [
    { offset: -4, dst: 1, utc: t.mins(-59).n },
    { offset: -5, dst: 0, utc: t.mins(1).n }
  ]);
  backward(t.mins(59).n, zone, [
    { offset: -4, dst: 1, utc: t.mins(-1).n },
    { offset: -5, dst: 0, utc: t.mins(59).n }
  ]);
  backward(t.mins(60).n, zone, [
    { offset: -5, dst: 0, utc: t.mins(60).n },
    { offset: -5, dst: 0, utc: t.mins(60).n }
  ]);
  backward(t.mins(120).n, zone, [
    { offset: -5, dst: 0, utc: t.mins(120).n },
    { offset: -5, dst: 0, utc: t.mins(120).n }
  ]);
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
  let t: Timestamp;

  // Sun Mar 29 2020 01:00:00 AM UTC
  t = new Timestamp(1585443600000);
  forward(t.mins(-120).n, zone, { offset: 1, dst: 0 });
  forward(t.mins(-30).n, zone, { offset: 1, dst: 0 });
  forward(t.mins(-1).n, zone, { offset: 1, dst: 0 });
  forward(t.n, zone, { offset: 2, dst: 1 });
  forward(t.mins(1).n, zone, { offset: 2, dst: 1 });
  forward(t.mins(30).n, zone, { offset: 2, dst: 1 });
  forward(t.mins(120).n, zone, { offset: 2, dst: 1 });
});

test('berlin fall', () => {
  const zone = 'Europe/Berlin';
  let t: Timestamp;

  // Sun Oct 25 2020 01:00:00 AM UTC
  t = new Timestamp(1603587600000);
  backward(t.mins(-120).n, zone, [
    { offset: 2, dst: 1, utc: t.mins(-120).n },
    { offset: 2, dst: 1, utc: t.mins(-120).n }
  ]);
  backward(t.mins(-60).n, zone, [
    { offset: 2, dst: 1, utc: t.mins(-60).n },
    { offset: 1, dst: 0, utc: t.mins(0).n }
  ]);
  backward(t.mins(-1).n, zone, [
    { offset: 2, dst: 1, utc: t.mins(-1).n },
    { offset: 1, dst: 0, utc: t.mins(59).n }
  ]);
  backward(t.n, zone, [
    { offset: 2, dst: 1, utc: t.mins(-60).n },
    { offset: 1, dst: 0, utc: t.n }
  ]);
  backward(t.mins(1).n, zone, [
    { offset: 2, dst: 1, utc: t.mins(-59).n },
    { offset: 1, dst: 0, utc: t.mins(1).n }
  ]);
  backward(t.mins(59).n, zone, [
    { offset: 2, dst: 1, utc: t.mins(-1).n },
    { offset: 1, dst: 0, utc: t.mins(59).n }
  ]);
  backward(t.mins(60).n, zone, [
    { offset: 1, dst: 0, utc: t.mins(60).n },
    { offset: 1, dst: 0, utc: t.mins(60).n }
  ]);
  backward(t.mins(120).n, zone, [
    { offset: 1, dst: 0, utc: t.mins(120).n },
    { offset: 1, dst: 0, utc: t.mins(120).n }
  ]);
});

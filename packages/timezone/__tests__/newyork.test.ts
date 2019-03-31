import { Timestamp } from './_helpers';
import { TZ, ZoneInfo } from '../src';

const ID = 'America/New_York';
const MAR102019_065930 = new Timestamp(1552201170000);
const NOV181883_170000 = new Timestamp(-2717650800000);

test('new york min / max', () => {
  const t = NOV181883_170000;

  let info = TZ.fromUTC(ID, Timestamp.MIN.n);
  expect(info).toEqual({ zoneid: ID, abbr: 'LMT', dst: 0, offset: -17762000 });

  info = TZ.fromUTC(ID, t.n);
  expect(info).toEqual({ zoneid: ID, abbr: 'EST', dst: 0, offset: -18000000 });

  info = TZ.fromUTC(ID, t.mins(-1).n);
  expect(info).toEqual({ zoneid: ID, abbr: 'LMT', dst: 0, offset: -17762000 });

  info = TZ.fromUTC(ID, Timestamp.MAX.n);
  expect(info).toEqual({ zoneid: ID, abbr: 'EST', dst: 0, offset: -18000000 });

  // TODO: wall time
  // info = TZ.fromWall(ID, Timestamp.MIN.n);
  // expect(info).toEqual({ zoneid: ID, abbr: 'LMT', dst: 0, offset: -17762000 });

  // info = TZ.fromWall(ID, t.n);
  // expect(info).toEqual({ zoneid: ID, abbr: 'EST', dst: 0, offset: -18000000 });

  // info = TZ.fromWall(ID, t.hours(-6).n);
  // expect(info).toEqual({ zoneid: ID, abbr: 'LMT', dst: 0, offset: -17762000 });

  // info = TZ.fromWall(ID, t.mins(-1).n);
  // expect(info).toEqual({ zoneid: ID, abbr: 'EST', dst: 0, offset: -18000000 });

  // info = TZ.fromWall(ID, Timestamp.MAX.n);
  // expect(info).toEqual({ zoneid: ID, abbr: 'EST', dst: 0, offset: -18000000 });
});

// test('round trips', () => {
//   const t = MAR102019_065930;
//   roundtrip(ID, t.n);
//   roundtrip(ID, t.mins(1).n);
//   roundtrip(ID, t.mins(2).n);
//   roundtrip(ID, t.mins(-1).n);
//   roundtrip(ID, t.mins(-2).n);
// });

test('new york utc', () => {
  const t = MAR102019_065930;
  let info: ZoneInfo | undefined;

  info = TZ.fromUTC(ID, t.n);
  expect(info).toEqual({ zoneid: ID, abbr: 'EST', dst: 0, offset: -18000000 });

  info = TZ.fromUTC(ID, t.secs(29).n);
  expect(info).toEqual({ zoneid: ID, abbr: 'EST', dst: 0, offset: -18000000 });

  info = TZ.fromUTC(ID, t.secs(30).n);
  expect(info).toEqual({ zoneid: ID, abbr: 'EDT', dst: 1, offset: -14400000 });

  info = TZ.fromUTC(ID, t.mins(1).n);
  expect(info).toEqual({ zoneid: ID, abbr: 'EDT', dst: 1, offset: -14400000 });
});

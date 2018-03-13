import { ZonedDateTime } from '../../../src/types/datetime';

const make = (epoch: number | Date, zoneId: string) => new ZonedDateTime(epoch, zoneId);

const EPOCH_JAN_01_2018_043045_UTC = 1514781045000;
const EPOCH_MAR_11_2018_132537_UTC = 1520774737000;

const NY = 'America/New_York';
const LA = 'America/Los_Angeles';
const LONDON = 'Europe/London';

const DEC_31_2017_233045_NY = make(EPOCH_JAN_01_2018_043045_UTC, NY);
const JAN_01_2018_043045_LONDON = make(EPOCH_JAN_01_2018_043045_UTC, LONDON);

const MAR_11_2018_092537_NY = make(EPOCH_MAR_11_2018_132537_UTC, NY);
const MAR_11_2018_132537_LONDON = make(EPOCH_MAR_11_2018_132537_UTC, LONDON);

test('epoch', () => {
  expect(MAR_11_2018_092537_NY.epochUTC()).toEqual(EPOCH_MAR_11_2018_132537_UTC);
  expect(MAR_11_2018_132537_LONDON.epochUTC()).toEqual(EPOCH_MAR_11_2018_132537_UTC);
});

test('unknown zone id', () => {
  // Unknown zones currently link to UTC zone info
  expect(make(1514781045000, 'Foo').metaZoneId()).toEqual('GMT');
});

test('date', () => {
  let d = MAR_11_2018_092537_NY;
  expect(d.getUTCYear()).toEqual(2018);
  expect(d.getYear()).toEqual(2018);
  expect(d.getUTCMonth()).toEqual(2);
  expect(d.getMonth()).toEqual(2);
  expect(d.getUTCDayOfMonth()).toEqual(11);
  expect(d.getDayOfMonth()).toEqual(11);

  d = DEC_31_2017_233045_NY;
  expect(d.getUTCYear()).toEqual(2018);
  expect(d.getYear()).toEqual(2017);

  d = MAR_11_2018_132537_LONDON;
  expect(d.getUTCYear()).toEqual(2018);
  expect(d.getYear()).toEqual(2018);

  d = JAN_01_2018_043045_LONDON;
  expect(d.getUTCYear()).toEqual(2018);
  expect(d.getYear()).toEqual(2018);
});

test('time', () => {
  let d = MAR_11_2018_092537_NY;
  expect(d.getUTCHour()).toEqual(13);
  expect(d.getHour()).toEqual(9);
  expect(d.getUTCMinute()).toEqual(25);
  expect(d.getMinute()).toEqual(25);
  expect(d.getSecond()).toEqual(37);
  expect(d.getMillisecond()).toEqual(0);

  d = DEC_31_2017_233045_NY;
  expect(d.getUTCHour()).toEqual(4);
  expect(d.getHour()).toEqual(23);
  expect(d.getUTCMinute()).toEqual(30);
  expect(d.getMinute()).toEqual(30);
  expect(d.getSecond()).toEqual(45);
  expect(d.getMillisecond()).toEqual(0);

  d = make(EPOCH_JAN_01_2018_043045_UTC + 217, NY);
  expect(d.getMillisecond()).toEqual(217);
});

test('day of year', () => {
  const day = (n: number) => make(EPOCH_JAN_01_2018_043045_UTC + (n * 86400000), NY);

  // +0 => Dec 31, 2017
  expect(day(0).getDayOfMonth()).toEqual(31);
  expect(day(0).getDayOfYear()).toEqual(365);

  // -5 => Dec 26, 2017
  expect(day(-5).getDayOfMonth()).toEqual(26);
  expect(day(-5).getDayOfYear()).toEqual(360);

  // +1 => Jan 1, 2018
  expect(day(1).getDayOfMonth()).toEqual(1);
  expect(day(1).getDayOfYear()).toEqual(1);

  // +65 => Mar 6 2018
  expect(day(65).getDayOfYear()).toEqual(65);
  expect(day(65).getMonth()).toEqual(2);
  expect(day(65).getDayOfMonth()).toEqual(6);
});

test('leap', () => {
  // Dec 31, 1999 8:15:38 PM NY time
  let d = make(946689338000, NY);
  expect(d.isLeapYear()).toEqual(false);
  expect(d.isUTCLeapYear()).toEqual(true);

  // March 11, 2000 10:15:38 AM
  d = make(952787738000, NY);
  expect(d.isLeapYear()).toEqual(true);
  expect(d.isUTCLeapYear()).toEqual(true);

  // March 11, 2003 10:15:38 AM
  d = make(1047395738000, NY);
  expect(d.isLeapYear()).toEqual(false);

  // March 11, 2004 10:15:38 AM
  d = make(1079018138000, NY);
  expect(d.isLeapYear()).toEqual(true);

  // March 11, 2008 10:15:38 AM
  d = make(1205248538000, NY);
  expect(d.isLeapYear()).toEqual(true);

  // March 11, 2009 10:15:38 AM
  d = make(1236784538000, NY);
  expect(d.isLeapYear()).toEqual(false);

  // March 11, 2100 10:15:38 AM
  d = make(4108461338000, NY);
  expect(d.isLeapYear()).toEqual(false);

  // March 11, 2200 10:15:38 AM
  d = make(7264134938000, NY);
  expect(d.isLeapYear()).toEqual(false);

  // March 11, 2400 10:15:38 AM
  d = make(13575568538000, NY);
  expect(d.isLeapYear()).toEqual(true);
});

test('to string', () => {
  // Dec 31, 1999 8:15:38 PM NY time
  const d = make(946689338000, NY);
  expect(d.toISOString()).toEqual('2000-01-01T01:15:38.000Z');
});

test('field of greatest difference', () => {
  const base = EPOCH_MAR_11_2018_132537_UTC;

  let d = make(base, NY).fieldOfGreatestDifference(make(base, NY));
  expect(d).toEqual('s');

  d = make(base, NY).fieldOfGreatestDifference(make(base + 2, NY));
  expect(d).toEqual('s');

  d = make(base, NY).fieldOfGreatestDifference(make(base + 27000, NY));
  expect(d).toEqual('m');

  const hour = 3600000;
  d = make(base, NY).fieldOfGreatestDifference(make(base + (2 * hour), NY));
  expect(d).toEqual('H');

  const day = 86400000;
  d = make(base, NY).fieldOfGreatestDifference(make(base + (3 * day), NY));
  expect(d).toEqual('d');

  d = make(base, NY).fieldOfGreatestDifference(make(base + (40 * day), NY));
  expect(d).toEqual('M');

  d = MAR_11_2018_092537_NY.fieldOfGreatestDifference(DEC_31_2017_233045_NY);
  expect(d).toEqual('y');

  d = DEC_31_2017_233045_NY.fieldOfGreatestDifference(MAR_11_2018_092537_NY);
  expect(d).toEqual('y');

  // Argument timezone will be converted
  d = make(base, NY).fieldOfGreatestDifference(make(base + (40 * day), LA));
  expect(d).toEqual('M');
});

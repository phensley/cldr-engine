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

  d = DEC_31_2017_233045_NY;
  expect(d.getUTCHour()).toEqual(4);
  expect(d.getHour()).toEqual(23);
  expect(d.getUTCMinute()).toEqual(30);
  expect(d.getMinute()).toEqual(30);
  expect(d.getSecond()).toEqual(45);
});

test('field of greatest difference', () => {
  const base = EPOCH_MAR_11_2018_132537_UTC;

  let d = make(base, NY).fieldOfGreatestDifference(make(base, NY));
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

  // Argument timezone will be converted
  d = make(base, NY).fieldOfGreatestDifference(make(base + (40 * day), LA));
  expect(d).toEqual('M');
});

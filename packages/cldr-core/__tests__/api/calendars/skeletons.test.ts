import { EN } from '../../_helpers';
import { Bundle, CalendarsImpl, InternalsImpl, PrivateApiImpl } from '../../../src';

import { parseDatePattern } from '../../../src/parsing/patterns/date';
import { DatePatternMatcher, DateSkeleton } from '../../../src/api/private/calendars/matcher';
import { DatePatternManager } from '../../../src/api/private/calendars/manager';
import { ZonedDateTime } from '../../../src';

const INTERNALS = new InternalsImpl();

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);

const parse = DateSkeleton.parse;
const parsePattern = DateSkeleton.parsePattern;

const datetime = (e: number, z: string) => new ZonedDateTime(e, z);

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const DAY = 86400000;
const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

test('compound split', () => {
  let d: DateSkeleton;
  let t: DateSkeleton;

  d = parse('GyMMMdhmsv');

  expect(d.compound()).toEqual(true);
  expect(d.isDate()).toEqual(true);
  expect(d.isTime()).toEqual(true);

  t = d.split();
  expect(d.compound()).toEqual(false);
  expect(d.isDate()).toEqual(true);
  expect(d.isTime()).toEqual(false);
  expect(d.toString()).toEqual('GyMMMd');

  expect(t.compound()).toEqual(false);
  expect(t.isDate()).toEqual(false);
  expect(t.isTime()).toEqual(true);
  expect(t.toString()).toEqual('hmsv');
});

test('matching skeletons', () => {
  const api = privateApi(EN);
  const params = api.getNumberParams('latn');

  const m = new DatePatternManager(EN, INTERNALS, 10);
  const d = datetime(MARCH_11_2018_070025_UTC, 'America/New_York');
  let r = m.getRequest(d, { skeleton: 'yw' }, params);
  expect(r.date).toEqual(['week ', ['w', 1], ' of ', ['Y', 1]]);
  expect(r.time).toEqual(undefined);

  // TODO: append individual missing fields to pattern
  r = m.getRequest(d, { skeleton: 'ywd' }, params);
  expect(r.date).toEqual(['week ', ['w', 1], ' of ', ['Y', 1]]);
  expect(r.time).toEqual(undefined);

  r = m.getRequest(d, { skeleton: 'MMMMW' }, params);
  expect(r.date).toEqual(['week ', ['W', 1], ' of ', ['M', 4]]);
  expect(r.time).toEqual(undefined);

  r = m.getRequest(d, { skeleton: 'yQQQQQd' }, params);
  expect(r.date).toEqual([['Q', 5], ' ', ['y', 1]]);
  expect(r.time).toEqual(undefined);

  r = m.getRequest(d, { skeleton: 'yMMMdhmsv' }, params);
  expect(r.date).toEqual([['M', 3], ' ', ['d', 1], ', ', ['y', 1]]);
  expect(r.time).toEqual([['h', 1], ':', ['m', 2], ':', ['s', 2], ' ', ['a', 1], ' ', ['v', 1]]);

  r = m.getRequest(d, { date: 'full' }, params);
  expect(r.date).toEqual([['E', 4], ', ', ['M', 4], ' ', ['d', 1], ', ', ['y', 1]]);
  expect(r.time).toEqual(undefined);
});

test('parsing skeletons', () => {
  // date: full, long, medium, short
  expect(parsePattern('EEEE, MMMM d, y').toString()).toEqual('yMMMMEd');
  expect(parsePattern('MMMM d, y').toString()).toEqual('yMMMMd');
  expect(parsePattern('MMM d, y').toString()).toEqual('yMMMd');
  expect(parsePattern('M/d/yy').toString()).toEqual('yMd');

  // time: full, long, medium, short
  expect(parsePattern('h:mm:ss a zzzz').toString()).toEqual('hmsz');
  expect(parsePattern('h:mm:ss a z').toString()).toEqual('hmsz');
  expect(parsePattern('h:mm:ss a').toString()).toEqual('hms');
  expect(parsePattern('h:mm a').toString()).toEqual('hm');

  // patterns that equal their skeletons (not all are, for backwards-compat reasons)
  expect(parsePattern('h B').toString()).toEqual('Bh');
  expect(parsePattern('h:mm B').toString()).toEqual('Bhm');
  expect(parsePattern('h:mm:ss B').toString()).toEqual('Bhms');
  expect(parsePattern('d').toString()).toEqual('d');
  expect(parsePattern('E, MMM d, y G').toString()).toEqual('GyMMMEd');
  expect(parsePattern(`'week' W 'of' MMMM`).toString()).toEqual('MMMMW');
  expect(parsePattern('yMMMd').toString()).toEqual('yMMMd');
  expect(parsePattern('h:mm:ss a v').toString()).toEqual('hmsv');
});

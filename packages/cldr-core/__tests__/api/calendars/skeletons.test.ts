import { DateSkeleton, DateSkeletonParser } from '../../../src/internals/calendars/skeleton';

const PARSER = new DateSkeletonParser([], []);
const parse = (s: string, isPattern: boolean = false) => PARSER.parse(s, isPattern);

test('compound split', () => {
  let d: DateSkeleton;
  let t: DateSkeleton;

  d = parse('GyMMMdhmsv');

  expect(d.compound()).toEqual(true);
  expect(d.isDate).toEqual(true);
  expect(d.isTime).toEqual(true);

  t = d.split();
  expect(d.compound()).toEqual(false);
  expect(d.isDate).toEqual(true);
  expect(d.isTime).toEqual(false);
  expect(d.canonical()).toEqual('GyMMMd');

  expect(t.compound()).toEqual(false);
  expect(t.isDate).toEqual(false);
  expect(t.isTime).toEqual(true);
  expect(t.canonical()).toEqual('hmsv');
});

test('parsing skeletons', () => {
  // date: full, long, medium, short
  expect(parse('EEEE, MMMM d, y', true).canonical()).toEqual('yMMMMEd');
  expect(parse('MMMM d, y', true).canonical()).toEqual('yMMMMd');
  expect(parse('MMM d, y', true).canonical()).toEqual('yMMMd');
  expect(parse('M/d/yy', true).canonical()).toEqual('yMd');

  // time: full, long, medium, short
  expect(parse('h:mm:ss a zzzz', true).canonical()).toEqual('hmsz');
  expect(parse('h:mm:ss a z', true).canonical()).toEqual('hmsz');
  expect(parse('h:mm:ss a', true).canonical()).toEqual('hms');
  expect(parse('h:mm a', true).canonical()).toEqual('hm');

  // patterns that equal their skeletons (not all are, for backwards-compat reasons)
  expect(parse('h B', true).canonical()).toEqual('Bh');
  expect(parse('h:mm B', true).canonical()).toEqual('Bhm');
  expect(parse('h:mm:ss B', true).canonical()).toEqual('Bhms');
  expect(parse('d', true).canonical()).toEqual('d');
  expect(parse('E, MMM d, y G', true).canonical()).toEqual('GyMMMEd');
  expect(parse(`'week' W 'of' MMMM`, true).canonical()).toEqual('MMMMW');
  expect(parse('yMMMd', true).canonical()).toEqual('yMMMd');
  expect(parse('h:mm:ss a v', true).canonical()).toEqual('hmsv');
});

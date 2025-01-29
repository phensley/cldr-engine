import { DatePatternMatcher, DateSkeleton, DateSkeletonParser } from '../../../src/internals/calendars/skeleton';

const PARSER = new DateSkeletonParser([['h', 1]], [['h', 1]]);
const parse = (s: string, isPattern: boolean = false) => PARSER.parse(s, isPattern);

test('parsing skeleton hour cycle selection', () => {
  let parser = new DateSkeletonParser([['H', 1]], [['H', 1]]);

  expect(parser.parse('j').canonical()).toEqual('H');
  expect(parser.parse('J').canonical()).toEqual('H');
  expect(parser.parse('C').canonical()).toEqual('H');

  parser = new DateSkeletonParser([['h', 1]], [['h', 1]]);

  expect(parser.parse('jm').canonical()).toEqual('ahm');
  expect(parser.parse('Jm').canonical()).toEqual('hm');
  expect(parser.parse('Cm').canonical()).toEqual('ahm');
});

test('compound split', () => {
  let d: DateSkeleton;
  let t: DateSkeleton;

  // empty
  d = parse('');
  expect(d.compound()).toEqual(false);
  expect(d.isDate).toEqual(false);
  expect(d.isTime).toEqual(false);

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
  expect(t.canonical()).toEqual('ahmsv');
});

test('parsing skeletons', () => {
  // date: full, long, medium, short
  expect(parse('EEEE, MMMM d, y', true).canonical()).toEqual('yMMMMEd');
  expect(parse('MMMM d, y', true).canonical()).toEqual('yMMMMd');
  expect(parse('MMM d, y', true).canonical()).toEqual('yMMMd');
  expect(parse('M/d/yy', true).canonical()).toEqual('yMd');

  // time: full, long, medium, short
  expect(parse('h:mm:ss a zzzz', true).canonical()).toEqual('ahmsz');
  expect(parse('h:mm:ss a z', true).canonical()).toEqual('ahmsz');
  expect(parse('h:mm:ss a', true).canonical()).toEqual('ahms');
  expect(parse('h:mm a', true).canonical()).toEqual('ahm');

  // patterns that equal their skeletons (not all are, for backwards-compat reasons)
  expect(parse('h B', true).canonical()).toEqual('Bh');
  expect(parse('h:mm B', true).canonical()).toEqual('Bhm');
  expect(parse('h:mm:ss B', true).canonical()).toEqual('Bhms');
  expect(parse('d', true).canonical()).toEqual('d');
  expect(parse('E, MMM d, y G', true).canonical()).toEqual('GyMMMEd');
  expect(parse(`'week' W 'of' MMMM`, true).canonical()).toEqual('MMMMW');
  expect(parse('yMMMd', true).canonical()).toEqual('yMMMd');
  expect(parse('h:mm:ss a v', true).canonical()).toEqual('ahmsv');
});

test('matching small fields', () => {
  const skeletons = ['H', 'Hm', 'h', 'hm', 'y', 'M', 'd'];
  const matcher = new DatePatternMatcher<any>();
  skeletons.map((s) => parse(s)).forEach((s) => matcher.add(s));

  // 'H' ranks above 'h' in the field scoring.
  const skel = (s: string) => matcher.match(parse(s)).skeleton.skeleton;
  expect(skel('m')).toEqual('Hm');
  expect(skel('s')).toEqual('H');
  expect(skel('v')).toEqual('H');
});

test('matching field widths', () => {
  const skeletons = [
    'y',
    'yM',
    'yMEd',
    'yMMM',
    'yMMMEEEEd',
    'yMMMEd',
    'yMMMM',
    'yMMMMEEEEd',
    'yMMMMEd',
    'yMMMMd',
    'yMMMd',
    'yMd',
  ];
  const matcher = new DatePatternMatcher<any>();
  skeletons.map((s) => parse(s)).forEach((s) => matcher.add(s));

  const skel = (s: string) => matcher.match(parse(s)).skeleton.skeleton;
  expect(skel('yMEd')).toEqual('yMEd');
  expect(skel('yMEEd')).toEqual('yMEd');
  expect(skel('yMMEEd')).toEqual('yMEd');
  expect(skel('yMMMEEd')).toEqual('yMMMEd');
  expect(skel('yMMMEEEd')).toEqual('yMMMEd');
  expect(skel('yMMMMEEEEd')).toEqual('yMMMMEEEEd');
  // Field width constraints enforced
  expect(skel('yMMMMMMEEEEEEd')).toEqual('yMMMEd');
});

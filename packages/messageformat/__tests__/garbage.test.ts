import {
  parseMessagePattern,
  stickyRegexp,
  StickyMatcher,
} from '../src';

const NAMES = ['decimal', 'unit', 'currency', 'datetime', 'datetime-interval', 'number'];

const matcher = () => new StickyMatcher(NAMES, stickyRegexp);

const parse = (s: string) => parseMessagePattern(s, matcher());

const VALID: string[] = [
  '{0 plural =1 {1} one {one} many {many} other {other}}',
  '{0 plural offset:1 =1 {1} other{other}}',
  '{2 select male {male} female {female} other {other}}',
  '{0 datetime long}',
  '{0;1 datetime-interval yMMMd}',
  '{0 currency format:long}',
  '{0 unit in:seconds sequence:day,hour,minute}',
  '{0 selectordinal one{st} other{th}}',
  '{0 number format:long}'
];

const GARBAGE: string[] = [
  ',', "'", "''", ' ', '{', '}', '*', ';', '!',
];

const generate = (threshold: number) => {
  const ix = (Math.random() * VALID.length) | 0;
  const v = VALID[ix];
  let r = '';
  for (let i = 0; i < v.length; i++) {
    if (Math.random() < threshold) {
      r += GARBAGE[i % GARBAGE.length];
    } else {
      r += v[i];
    }
  }
  return r;
};

test('garbage inputs', () => {
  // Ensure that random garbage at least completes parse successfully.
  // It may not make any sense when evaluated but at least we don't
  // lock up the parser.
  const iters = 20000;
  for (let i = 0; i < iters; i++) {
    for (const threshold of [0.05, 0.3, 0.7]) {
      const input = generate(threshold);
      parse(input);
    }
  }
});

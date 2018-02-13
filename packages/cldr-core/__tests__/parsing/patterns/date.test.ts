import { parseDatePattern, Field, intervalPatternBoundary } from '../../../src/parsing/patterns/date';

const field = (s: string, n: number) => new Field(s, n);

test('parse', () => {
  expect(parseDatePattern("'week' W 'of' MMMM")).toEqual([
    'week ', field('W', 1), ' of ', field('M', 4)
  ]);

  expect(parseDatePattern('E, d MMM y G')).toEqual([
    field('E', 1), ', ', field('d', 1), ' ', field('M', 3), ' ', field('y', 1), ' ', field('G', 1)
  ]);

  expect(parseDatePattern("yMMMd 'yMd'")).toEqual([
    field('y', 1), field('M', 3), field('d', 1), ' yMd'
  ]);
});

test('interval boundary', () => {
  let pattern = parseDatePattern("yyy MMM x 'and' x MMM");
  expect(pattern).toEqual([
    field('y', 3), ' ',
    field('M', 3), ' ',
    field('x', 1), ' and ',
    field('x', 1), // 6 - boundary
    ' ',
    field('M', 3)
  ]);
  expect(intervalPatternBoundary(pattern)).toEqual(6);

  pattern = parseDatePattern('E, dd/MM/y – E, dd/MM/y');
  expect(intervalPatternBoundary(pattern)).toEqual(8);

  pattern = parseDatePattern('h:mm a – h:mm a');
  expect(intervalPatternBoundary(pattern)).toEqual(6);
});

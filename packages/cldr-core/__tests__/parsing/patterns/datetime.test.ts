import { parseDatePattern, Field } from '../../../src/parsing/patterns/date';

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

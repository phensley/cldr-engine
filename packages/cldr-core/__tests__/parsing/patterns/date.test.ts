import { intervalPatternBoundary, parseDatePattern, DateTimeField } from '../../../src/parsing/patterns/date';

const datefield = (field: string, width: number) => ({ field, width });

test('parse', () => {
  expect(parseDatePattern("'week' W 'of' MMMM")).toEqual([
    'week ',
    ['W', 1],
    ' of ',
    ['M', 4]
  ]);

  expect(parseDatePattern('E, d MMM y G')).toEqual([
    ['E', 1],
    ', ',
    ['d', 1],
    ' ',
    ['M', 3],
    ' ',
    ['y', 1],
    ' ',
    ['G', 1],
  ]);

  expect(parseDatePattern("yMMMd 'yMd'")).toEqual([
    ['y', 1], ['M', 3], ['d', 1], ' yMd'
  ]);

  expect(parseDatePattern('h:mm !!')).toEqual([
    ['h', 1],
    ':',
    ['m', 2],
    ' !!'
  ]);

  expect(parseDatePattern('yMd')).toEqual([
    ['y', 1],
    ['M', 1],
    ['d', 1]
  ]);

});

test('interval boundary', () => {
  let pattern = parseDatePattern("yyy MMM x 'and' x MMM");
  expect(pattern).toEqual([
    ['y', 3], ' ',
    ['M', 3], ' ',
    ['x', 1], ' and ',
    ['x', 1], // 6 - boundary
    ' ',
    ['M', 3]
  ]);
  expect(intervalPatternBoundary(pattern)).toEqual(6);

  pattern = parseDatePattern('E, dd/MM/y – E, dd/MM/y');
  expect(intervalPatternBoundary(pattern)).toEqual(8);

  pattern = parseDatePattern('h:mm a – h:mm a');
  expect(intervalPatternBoundary(pattern)).toEqual(6);

  pattern = parseDatePattern('h:mm a');
  expect(intervalPatternBoundary(pattern)).toEqual(-1);
});

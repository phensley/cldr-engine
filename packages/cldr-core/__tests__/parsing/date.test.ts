import { intervalPatternBoundary, parseDatePattern } from '../../src/parsing/date';

test('parse', () => {
  expect(parseDatePattern("'week' W 'of' MMMM")).toEqual(['week ', ['W', 1], ' of ', ['M', 4]]);

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

  expect(parseDatePattern("yMMMd 'yMd'")).toEqual([['y', 1], ['M', 3], ['d', 1], ' yMd']);

  expect(parseDatePattern('h:mm !!')).toEqual([['h', 1], ':', ['m', 2], ' !!']);

  expect(parseDatePattern('yMd')).toEqual([
    ['y', 1],
    ['M', 1],
    ['d', 1],
  ]);
});

test('quoted apostrophe escapes', () => {
  // TR35: '' inside a quoted section yields one literal apostrophe.
  // ICU4J: yyyy 'o''clock' => 2024 o'clock
  expect(parseDatePattern("yyyy 'o''clock'")).toEqual([['y', 4], " o'clock"]);

  // Whole-pattern out-of-quote '' yields one literal apostrophe (ICU parity;
  // ICU4J: '' => ').
  expect(parseDatePattern("''")).toEqual(["'"]);

  // Out-of-quote '' between fields is a literal apostrophe, not an empty
  // quoted section (ICU4J: yyyy'' MM => 2024' 03).
  expect(parseDatePattern("yyyy'' MM")).toEqual([['y', 4], "' ", ['M', 2]]);

  // A single in-quote apostrophe closes the quote as before; subsequent
  // letters are parsed as pattern fields. Behavior is intentionally lenient
  // (ICU4J rejects this pattern with IllegalArgumentException; we keep
  // parsing and pin the existing output).
  expect(parseDatePattern("yyyy 'o'clock'")).toEqual([['y', 4], ' o', ['c', 1], ['l', 1], 'o', ['c', 1], ['k', 1], '']);

  // A pattern ending in a dangling single quote keeps the existing lenient
  // behavior: the quote opens a run that runs to end of input.
  expect(parseDatePattern("yyyy'")).toEqual([['y', 4], '']);

  // Unquoted text with an unclosed opening quote still lands in the buffer.
  expect(parseDatePattern("yyyy 'abc")).toEqual([['y', 4], ' abc']);
});

test('interval boundary', () => {
  let pattern = parseDatePattern("yyy MMM x 'and' x MMM");
  expect(pattern).toEqual([
    ['y', 3],
    ' ',
    ['M', 3],
    ' ',
    ['x', 1],
    ' and ',
    ['x', 1], // 6 - boundary
    ' ',
    ['M', 3],
  ]);
  expect(intervalPatternBoundary(pattern)).toEqual(6);

  pattern = parseDatePattern('E, dd/MM/y – E, dd/MM/y');
  expect(intervalPatternBoundary(pattern)).toEqual(8);

  pattern = parseDatePattern('h:mm a – h:mm a');
  expect(intervalPatternBoundary(pattern)).toEqual(6);

  pattern = parseDatePattern('h:mm a');
  expect(intervalPatternBoundary(pattern)).toEqual(-1);
});

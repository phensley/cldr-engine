import { parsePluralRule, AndCondition, Expr, OrCondition, Range, Rule } from '../../src/parsing';

test('rule parse', () => {
  const rule = 'v = 0 and i % 10 = 1 or v % 10 = 2,3..6 @integer 1, 21, 31';
  const result = parsePluralRule(rule);
  expect(result.isJust()).toEqual(true);

  const { _1, _2 } = result.get();
  expect(_2).toEqual('');

  const expected = new Rule(
    new OrCondition([
      new AndCondition([new Expr('v', 0, '=', [0]), new Expr('i', 10, '=', [1])]),
      new AndCondition([new Expr('v', 10, '=', [2, new Range(3, 6)])]),
    ]),
    '@integer 1, 21, 31',
  );

  expect(_1).toEqual(expected);
});

test('rule compact', () => {
  const rule = 'v = 0 and i % 10 = 1 or v % 10 = 2,3..6 @integer 1, 21, 31';
  const result = parsePluralRule(rule);
  const { _1 } = result.get();
  expect(_1.compact()).toEqual([
    [
      ['v', 0, 1, [0]],
      ['i', 10, 1, [1]],
    ],
    [['v', 10, 1, [2, [3, 6]]]],
  ]);
});

test('rule french many', () => {
  const rule =
    'e = 0 and i != 0 and i % 1000000 = 0 and v = 0 or e != 0..5 ' +
    '@integer 1000000, 1e6, 2e6, 3e6, 4e6, 5e6, 6e6, … ' +
    '@decimal 1.0000001e6, 1.1e6, 2.0000001e6, 2.1e6, 3.0000001e6, 3.1e6, …';
  const result = parsePluralRule(rule);
  expect(result.isJust()).toEqual(true);
  const { _1 } = result.get();
  expect(_1.compact()).toEqual([
    [
      ['c', 0, 1, [0]],
      ['i', 0, 0, [0]],
      ['i', 1000000, 1, [0]],
      ['v', 0, 1, [0]],
    ],
    [['c', 0, 0, [[0, 5]]]],
  ]);
});

import {
  parsePluralRule,
  AndCondition,
  Expr,
  OrCondition,
  Range,
  Rule
} from '../../src/parsing';

test('rule parse', () => {
  const rule = 'v = 0 and i % 10 = 1 or v % 10 = 2,3..6 @integer 1, 21, 31';
  const result = parsePluralRule(rule);
  expect(result.isJust()).toEqual(true);

  const { _1, _2 } = result.get();
  expect(_2).toEqual('');

  const expected = new Rule(new OrCondition([
    new AndCondition([
      new Expr('v', 0, '=', [0]),
      new Expr('i', 10, '=', [1]),
    ]), new AndCondition([
      new Expr('v', 10, '=', [2, new Range(3, 6)])
    ])
  ]), '@integer 1, 21, 31');

  expect(_1).toEqual(expected);
});

test('rule compact', () => {
  const rule = 'v = 0 and i % 10 = 1 or v % 10 = 2,3..6 @integer 1, 21, 31';
  const result = parsePluralRule(rule);
  const { _1 } = result.get();
  expect(_1.compact()).toEqual('v0:0&i10:1|v10:2,3:6');
});

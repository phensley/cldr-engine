import { Decimal } from '@phensley/decimal';
import { PluralCond, PluralExpr } from '../src/types';

const d = (n: number) => new Decimal(n);

test('parse compact', () => {
  const expr = new PluralExpr('i100=:2,4,17,12:14,93:145');
  expect(expr.operand).toEqual('i');
  expect(expr.mod).toEqual(d(100));
  expect(expr.operator).toEqual('=');
  expect(expr.ranges).toEqual([d(2), d(4), d(17), [d(12), d(14)], [d(93), d(145)]]);

  // integers in conditions are indices into the expressions array
  const cond = new PluralCond('B|25&48|49&50|51&52');
  expect(cond.category).toEqual('one');
  expect(cond.conditions).toEqual([ [25, 48], [49, 50], [51, 52] ]);
});

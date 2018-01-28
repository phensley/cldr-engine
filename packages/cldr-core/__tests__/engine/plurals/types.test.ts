import { Plural } from '@phensley/cldr-schema';
import { PluralCond, PluralExpr } from '../../../src/engine/plurals/types';

test('parse compact', () => {
  const expr = new PluralExpr('i100=:2,4,17,12:14,93:145');
  expect(expr.operand).toEqual('i');
  expect(expr.mod).toEqual(100);
  expect(expr.operator).toEqual('=');
  expect(expr.ranges).toEqual([2, 4, 17, [12, 14], [93, 145]]);

  const cond = new PluralCond('B|25&48|49&50|51&52');
  expect(cond.category).toEqual(Plural.ONE);
  expect(cond.conditions).toEqual([ [25, 48], [49, 50], [51, 52] ]);
});

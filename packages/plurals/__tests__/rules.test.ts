import { Decimal } from '@phensley/decimal';
import { pluralRules } from '../src';

test('missing rules', () => {
  const op = pluralRules.operands(new Decimal('12345.678'));

  let cat = pluralRules.cardinal('xyz', op);
  expect(cat).toEqual('other');

  cat = pluralRules.ordinal('xyz', op);
  expect(cat).toEqual('other');
});

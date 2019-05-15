import { Decimal } from '@phensley/decimal';
import { pluralRules } from '../../../src/systems/plurals';

test('missing rules', () => {
  const op = new Decimal('12345.678').operands();

  let cat = pluralRules.cardinal('xyz', op);
  expect(cat).toEqual('other');

  cat = pluralRules.ordinal('xyz', op);
  expect(cat).toEqual('other');
});

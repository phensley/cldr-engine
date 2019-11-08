import { Decimal } from '@phensley/decimal';
import { pluralRules } from '../src';

test('missing rules', () => {
  const n = new Decimal('12345.678');

  let cat = pluralRules.cardinal('xyz', n);
  expect(cat).toEqual('other');

  cat = pluralRules.ordinal('xyz', n);
  expect(cat).toEqual('other');
});

import { Decimal } from '@phensley/decimal';
import { pluralRules } from '../src';

test('missing rules', () => {
  const rules = pluralRules.get('xyz');
  const n = new Decimal('12345.678');

  let cat = rules.cardinal(n);
  expect(cat).toEqual('other');

  cat = rules.ordinal(n);
  expect(cat).toEqual('other');
});

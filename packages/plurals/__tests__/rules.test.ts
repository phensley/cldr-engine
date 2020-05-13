import { Decimal } from '@phensley/decimal';
import { pluralRules, PluralRules } from '../src';

test('missing rules', () => {
  const rules: PluralRules = pluralRules.get('xyz');
  const n = new Decimal('12345.678');

  let cat = rules.cardinal(n);
  expect(cat).toEqual('other');

  cat = rules.ordinal(n);
  expect(cat).toEqual('other');
});

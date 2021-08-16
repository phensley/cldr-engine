import { Decimal } from '@phensley/decimal';
import { pluralRules, Plurals, PluralRules } from '../src';

test('missing rules', () => {
  const rules: PluralRules = pluralRules.get('xyz');
  const n = new Decimal('12345.678');

  let cat = rules.cardinal(n);
  expect(cat).toEqual('other');

  cat = rules.ordinal(n);
  expect(cat).toEqual('other');
});

test('constructor', () => {
  const rules: PluralRules = new Plurals().get('en');

  let cat = rules.cardinal(new Decimal('1'));
  expect(cat).toEqual('one');

  cat = rules.cardinal(new Decimal('5'));
  expect(cat).toEqual('other');
});

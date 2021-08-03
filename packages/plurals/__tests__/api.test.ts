import { Decimal } from '@phensley/decimal';
import { pluralRules, Plurals, PluralRules } from '../src';

test('basic', () => {
  const lang = 'en';
  const plurals: Plurals = pluralRules;
  const rules: PluralRules = plurals.get(lang);

  expect(rules.operands(new Decimal('123'))).toEqual({
    f: 0,
    i: 123,
    n: 123,
    t: 0,
    v: 0,
    w: 0,
    c: 0,
  });

  expect(rules.cardinal(0)).toEqual('other');
  expect(rules.cardinal('0')).toEqual('other');
  expect(rules.cardinal(new Decimal(0))).toEqual('other');

  expect(rules.cardinal(1)).toEqual('one');
  expect(rules.cardinal('1')).toEqual('one');
  expect(rules.cardinal(new Decimal(1))).toEqual('one');
});

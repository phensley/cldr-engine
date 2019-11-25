import { Decimal } from '@phensley/decimal';
import { pluralRules } from '../src';

test('basic', () => {
  const lang = 'en';
  const rules = pluralRules.get(lang);

  expect(rules.cardinal(0)).toEqual('other');
  expect(rules.cardinal('0')).toEqual('other');
  expect(rules.cardinal(new Decimal(0))).toEqual('other');

  expect(rules.cardinal(1)).toEqual('one');
  expect(rules.cardinal('1')).toEqual('one');
  expect(rules.cardinal(new Decimal(1))).toEqual('one');
});
import { Decimal } from '@phensley/decimal';
import { pluralRules } from '../src';

test('basic', () => {
  const lang = 'en';

  expect(pluralRules.cardinal(lang, 0)).toEqual('other');
  expect(pluralRules.cardinal(lang, '0')).toEqual('other');
  expect(pluralRules.cardinal(lang, new Decimal(0))).toEqual('other');

  expect(pluralRules.cardinal(lang, 1)).toEqual('one');
  expect(pluralRules.cardinal(lang, '1')).toEqual('one');
  expect(pluralRules.cardinal(lang, new Decimal(1))).toEqual('one');
});
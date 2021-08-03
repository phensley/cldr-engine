import { pluralRules } from '../src';

const cardinal = (lang: string, n: string, c: number = 0) => pluralRules.get(lang).cardinal(n, c);

test('english', () => {
  const lang = 'en';
  expect(cardinal(lang, '0')).toEqual('other');
  expect(cardinal(lang, '1')).toEqual('one');
  expect(cardinal(lang, '2')).toEqual('other');
  expect(cardinal(lang, '10')).toEqual('other');

  expect(cardinal(lang, '1.0')).toEqual('other');
  expect(cardinal(lang, '1.5')).toEqual('other');
});

test('french', () => {
  const lang = 'fr';
  expect(cardinal(lang, '0')).toEqual('one');
  expect(cardinal(lang, '1')).toEqual('one');
  expect(cardinal(lang, '2')).toEqual('other');
  expect(cardinal(lang, '10')).toEqual('other');

  expect(cardinal(lang, '1.2')).toEqual('one');
  expect(cardinal(lang, '1.7')).toEqual('one');

  expect(cardinal(lang, '100000')).toEqual('other');
  expect(cardinal(lang, '1000000')).toEqual('many');

  // Compact format specifies the compact shifted exponent
  expect(cardinal(lang, '100000', 5)).toEqual('other');
  expect(cardinal(lang, '1000000', 6)).toEqual('many');
  expect(cardinal(lang, '30000001', 6)).toEqual('many');
});

test('lithuanian', () => {
  const lang = 'lt';
  expect(cardinal(lang, '0')).toEqual('other');
  expect(cardinal(lang, '1')).toEqual('one');
  expect(cardinal(lang, '2')).toEqual('few');
  expect(cardinal(lang, '5')).toEqual('few');
  expect(cardinal(lang, '10')).toEqual('other');
  expect(cardinal(lang, '15')).toEqual('other');
  expect(cardinal(lang, '21')).toEqual('one');

  expect(cardinal(lang, '0.1')).toEqual('many');
  expect(cardinal(lang, '1.9')).toEqual('many');
  expect(cardinal(lang, '20.0')).toEqual('other');
  expect(cardinal(lang, '20.1')).toEqual('many');
  expect(cardinal(lang, '21.0')).toEqual('one');
  expect(cardinal(lang, '31.0')).toEqual('one');
});

test('polish', () => {
  const lang = 'pl';
  expect(cardinal(lang, '0')).toEqual('many');
  expect(cardinal(lang, '1')).toEqual('one');
  expect(cardinal(lang, '2')).toEqual('few');
  expect(cardinal(lang, '3')).toEqual('few');
  expect(cardinal(lang, '4')).toEqual('few');
  expect(cardinal(lang, '5')).toEqual('many');
  expect(cardinal(lang, '9')).toEqual('many');
  expect(cardinal(lang, '15')).toEqual('many');

  expect(cardinal(lang, '0.0')).toEqual('other');
  expect(cardinal(lang, '1.0')).toEqual('other');
  expect(cardinal(lang, '1.1')).toEqual('other');
});

test('welsh', () => {
  const lang = 'cy';
  expect(cardinal(lang, '0')).toEqual('zero');
  expect(cardinal(lang, '0.0')).toEqual('zero');
  expect(cardinal(lang, '1')).toEqual('one');
  expect(cardinal(lang, '1.0')).toEqual('one');
  expect(cardinal(lang, '2')).toEqual('two');
  expect(cardinal(lang, '2.0')).toEqual('two');
  expect(cardinal(lang, '3')).toEqual('few');
  expect(cardinal(lang, '3.0')).toEqual('few');
  expect(cardinal(lang, '6')).toEqual('many');
  expect(cardinal(lang, '6.0')).toEqual('many');

  expect(cardinal(lang, '1.1')).toEqual('other');
  expect(cardinal(lang, '2.5')).toEqual('other');
  expect(cardinal(lang, '4')).toEqual('other');
  expect(cardinal(lang, '4.0')).toEqual('other');
  expect(cardinal(lang, '15')).toEqual('other');
});

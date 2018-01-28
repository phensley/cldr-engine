import { Plural } from '@phensley/cldr-schema';
import { pluralCardinal, NumberOperands } from '../../../src/engine/plurals';

const cardinal = (lang: string, n: string) => pluralCardinal(lang, new NumberOperands(n));

test('english', () => {
  const lang = 'en';
  expect(cardinal(lang, '0')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '1')).toEqual(Plural.ONE);
  expect(cardinal(lang, '2')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '10')).toEqual(Plural.OTHER);

  expect(cardinal(lang, '1.0')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '1.5')).toEqual(Plural.OTHER);
});

test('french', () => {
  const lang = 'fr';
  expect(cardinal(lang, '0')).toEqual(Plural.ONE);
  expect(cardinal(lang, '1')).toEqual(Plural.ONE);
  expect(cardinal(lang, '2')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '10')).toEqual(Plural.OTHER);

  expect(cardinal(lang, '1.2')).toEqual(Plural.ONE);
  expect(cardinal(lang, '1.7')).toEqual(Plural.ONE);
});

test('lithuanian', () => {
  const lang = 'lt';
  expect(cardinal(lang, '0')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '1')).toEqual(Plural.ONE);
  expect(cardinal(lang, '2')).toEqual(Plural.FEW);
  expect(cardinal(lang, '5')).toEqual(Plural.FEW);
  expect(cardinal(lang, '10')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '15')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '21')).toEqual(Plural.ONE);

  expect(cardinal(lang, '0.1')).toEqual(Plural.MANY);
  expect(cardinal(lang, '1.9')).toEqual(Plural.MANY);
  expect(cardinal(lang, '20.0')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '20.1')).toEqual(Plural.MANY);
  expect(cardinal(lang, '21.0')).toEqual(Plural.ONE);
  expect(cardinal(lang, '31.0')).toEqual(Plural.ONE);
});

test('polish', () => {
  const lang = 'pl';
  expect(cardinal(lang, '0')).toEqual(Plural.MANY);
  expect(cardinal(lang, '1')).toEqual(Plural.ONE);
  expect(cardinal(lang, '2')).toEqual(Plural.FEW);
  expect(cardinal(lang, '3')).toEqual(Plural.FEW);
  expect(cardinal(lang, '4')).toEqual(Plural.FEW);
  expect(cardinal(lang, '5')).toEqual(Plural.MANY);
  expect(cardinal(lang, '9')).toEqual(Plural.MANY);
  expect(cardinal(lang, '15')).toEqual(Plural.MANY);

  expect(cardinal(lang, '0.0')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '1.0')).toEqual(Plural.OTHER);
  expect(cardinal(lang, '1.1')).toEqual(Plural.OTHER);
});

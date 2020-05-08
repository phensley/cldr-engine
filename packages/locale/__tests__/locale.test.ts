import { LanguageTag } from '@phensley/language-tag';
import { Locale } from '../src';

test('basics', () => {
  const tag = new LanguageTag('en', undefined, 'US');

  expect(tag.language()).toEqual('en');
  expect(tag.script()).toEqual('Zzzz');
  expect(tag.region()).toEqual('US');
  expect(tag.variant()).toEqual('');
  expect(tag.extensions()).toEqual({});
  expect(tag.privateUse()).toEqual('');

  expect(tag.compact()).toEqual('en-US');
  expect(tag.expanded()).toEqual('en-Zzzz-US');
});

test('canonicalization', () => {
  // NOTE: we may add deeper validation later, but for now
  // only basic subtag canonicalization is done.
  const tag = new LanguageTag('en', 'US');
  expect(tag.script()).toEqual('Us');
});

test('defaults', () => {
  let tag = new LanguageTag();
  expect(tag.compact()).toEqual('und');
  expect(tag.compact()).toEqual(tag.toString());
  expect(tag.language()).toEqual('und');
  expect(tag.script()).toEqual('Zzzz');
  expect(tag.region()).toEqual('ZZ');

  tag = new LanguageTag('und', 'Zzzz', 'ZZ');
  expect(tag.compact()).toEqual('und');
  expect(tag.compact()).toEqual(tag.toString());
  expect(tag.language()).toEqual('und');
  expect(tag.script()).toEqual('Zzzz');
  expect(tag.region()).toEqual('ZZ');

  tag = new LanguageTag('root', undefined, 'US');
  expect(tag.compact()).toEqual('und-US');
  expect(tag.compact()).toEqual(tag.toString());
  expect(tag.language()).toEqual('und');
  expect(tag.script()).toEqual('Zzzz');
  expect(tag.region()).toEqual('US');
});

test('parse locale', () => {
  expect(Locale.resolve('en')).toEqual({
    id: 'en',
    tag: new LanguageTag('en', 'Latn', 'US'),
  });
  expect(Locale.resolve('en-Latn-XY')).toEqual({
    id: 'en-Latn-XY',
    tag: new LanguageTag('en', 'Latn', 'XY'),
  });
  expect(Locale.resolve('fr-CA')).toEqual({
    id: 'fr-CA',
    tag: new LanguageTag('fr', 'Latn', 'CA'),
  });
  expect(Locale.resolve('iw')).toEqual({
    id: 'iw',
    tag: new LanguageTag('he', 'Hebr', 'IL'),
  });
  expect(Locale.resolve('und')).toEqual({
    id: 'und',
    tag: new LanguageTag('und', 'Zzzz', 'ZZ'),
  });
});

test('parse extensions', () => {
  expect(Locale.resolve('en-US-u-nu-thai')).toEqual({
    id: 'en-US-u-nu-thai',
    tag: new LanguageTag('en', 'Latn', 'US', '', { u: ['nu-thai'] }),
  });

  expect(Locale.resolve('en-US-u-nu-thai-ca-gregory')).toEqual({
    id: 'en-US-u-nu-thai-ca-gregory',
    tag: new LanguageTag('en', 'Latn', 'US', '', { u: ['ca-gregory', 'nu-thai'] }),
  });

  expect(Locale.resolve('en-US-u-nu-thai-u-foo-u-ca-gregory')).toEqual({
    id: 'en-US-u-nu-thai-u-foo-u-ca-gregory',
    tag: new LanguageTag('en', 'Latn', 'US', '', { u: ['ca-gregory', 'foo', 'nu-thai'] }),
  });
});

test('parse and render', () => {
  let { id, tag } = Locale.resolve('en-US-u-nu-thai-ca-buddhist-u-co-search');
  expect(id).toEqual('en-US-u-nu-thai-ca-buddhist-u-co-search');
  expect(tag.extensions()).toEqual({ u: ['ca-buddhist', 'co-search', 'nu-thai'] });
  expect(tag.expanded()).toEqual('en-Latn-US-u-ca-buddhist-co-search-nu-thai');

  ({ id, tag } = Locale.resolve('en-u-bar-nu-hant-co-standard-ca-islamic-umalqura'));
  expect(id).toEqual('en-u-bar-nu-hant-co-standard-ca-islamic-umalqura');
  expect(tag.extensions()).toEqual({ u: ['bar', 'ca-islamic-umalqura', 'co-standard', 'nu-hant'] });
  expect(tag.expanded()).toEqual('en-Latn-US-u-bar-ca-islamic-umalqura-co-standard-nu-hant');
});

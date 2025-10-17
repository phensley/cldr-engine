import { LanguageTag, parseLanguageTag } from '../src';

const compact = (s: string) => parseLanguageTag(s).compact();
const expanded = (s: string) => parseLanguageTag(s).expanded();
const privateUse = (s: string) => parseLanguageTag(s).privateUse();
const extensions = (s: string) => parseLanguageTag(s).extensions();
const extlangs = (s: string) => parseLanguageTag(s).extlangs();

test('basics', () => {
  expect(compact('!+')).toEqual('und');
  expect(compact('en-US')).toEqual('en-US');
  expect(compact('en-Latn-US')).toEqual('en-Latn-US');
  expect(compact('en-latn-us')).toEqual('en-Latn-US');
  expect(compact('xxxxxxxxxxx')).toEqual('und');

  expect(expanded('!+#%!')).toEqual('und-Zzzz-ZZ');
  expect(expanded('fr')).toEqual('fr-Zzzz-ZZ');
  expect(expanded('en-US')).toEqual('en-Zzzz-US');
});

test('variants', () => {
  expect(compact('en-VARIANT1-VARIANT2-VARIANT3')).toEqual('en-variant1');
});

test('case / underscore', () => {
  expect(compact('FR_latn_fr')).toEqual('fr-Latn-FR');
});

test('grandfathered', () => {
  expect(compact('i-klingon')).toEqual('tlh');
});

test('extlang subtags', () => {
  // Extlangs are currently parsed but ignored.
  expect(compact('ar-aao')).toEqual('ar');
  expect(compact('en-abc-def-us')).toEqual('en-US');

  expect(parseLanguageTag('arbv-arb')).toEqual(new LanguageTag('arbv', undefined, 'ARB'));
});

test('private use', () => {
  expect(compact('x-mytag')).toEqual('und-x-mytag');
  expect(privateUse('x-foo-x-bar-baz')).toEqual('x-foo-x-bar-baz');

  expect(compact('zh-x-foobar')).toEqual('zh-x-foobar');
  expect(privateUse('zh-x-foobar')).toEqual('x-foobar');

  expect(compact('zh-x-foo-x-bar-baz')).toEqual('zh-x-foo-x-bar-baz');
  expect(privateUse('zh-x-foo-x-bar-baz')).toEqual('x-foo-x-bar-baz');
});

test('private use incomplete', () => {
  expect(compact('x-')).toEqual('und');
  expect(privateUse('x-')).toEqual('');

  expect(compact('x--x--')).toEqual('und');
  expect(privateUse('x--x--')).toEqual('');
});

test('extensions', () => {
  expect(compact('en-US-u-cu-usd')).toEqual('en-US-u-cu-usd');
  expect(compact('fr-u-ca-islamic')).toEqual('fr-u-ca-islamic');
  expect(expanded('fr-u-ca-islamic')).toEqual('fr-Zzzz-ZZ-u-ca-islamic');
  expect(extensions('fr-u-ca-islamic-u_co_phonebk')).toEqual({ u: ['ca-islamic', 'co-phonebk'] });
  expect(extensions('fr-u-ca-islamic-ca-gregory')).toEqual({ u: ['ca-gregory', 'ca-islamic'] });

  expect(extensions('fr-u-xy-foobar')).toEqual({ u: ['xy-foobar'] });

  // Incomplete extension
  expect(extensions('fr-u')).toEqual({});
  expect(extensions('fr-u-ca')).toEqual({ u: ['ca'] });
  expect(extensions('fr-u-xy')).toEqual({ u: ['xy'] });
});

test('region replacement', () => {
  expect(compact('en-ARG')).toEqual('en-AR');
});

test('extlangs', () => {
  expect(extlangs('en-ext-lan')).toEqual(['ext', 'lan']);
});

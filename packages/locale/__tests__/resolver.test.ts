import { parseLanguageTag } from '@phensley/language-tag';
import { LanguageResolver } from '../src';

const { resolve, addLikelySubtags, removeLikelySubtags } = LanguageResolver;

const parse = parseLanguageTag;

test('resolve', () => {
  // Deprecated languages.
  expect(resolve('iw')).toEqual(parse('he-Hebr-IL'));

  // Language aliasees.
  expect(resolve('tah')).toEqual(parse('ty-Latn-PF'));

  // Territory aliases.
  expect(resolve('en-120')).toEqual(parse('en-Latn-CM'));
  expect(resolve('ru-172')).toEqual(parse('ru-Cyrl-RU'));

  // ISO 3166-1 3ALPHA codes replaced at parse time.
  expect(resolve('en-AAA')).toEqual(parse('en-Latn-AA'));
  expect(resolve('en-eng-eng-AAA')).toEqual(parse('en-Latn-AA'));
  expect(resolve('en-aaa')).toEqual(parse('en-Latn-AA'));

  // Add likely subtags.
  expect(resolve('he')).toEqual(parse('he-Hebr-IL'));
  expect(resolve('zh-Hanb')).toEqual(parse('zh-Hanb-TW'));
});

test('add likely subtags', () => {
  expect(addLikelySubtags('en')).toEqual(parse('en-Latn-US'));
  expect(addLikelySubtags('en-GB')).toEqual(parse('en-Latn-GB'));
  expect(addLikelySubtags('und-US')).toEqual(parse('en-Latn-US'));
  expect(addLikelySubtags('xx')).toEqual(parse('xx-Latn-US'));

  expect(addLikelySubtags('be')).toEqual(parse('be-Cyrl-BY'));
  expect(addLikelySubtags('be-BY')).toEqual(parse('be-Cyrl-BY'));
  expect(addLikelySubtags('und-BY')).toEqual(parse('be-Cyrl-BY'));

  expect(addLikelySubtags('en-u-cu-usd')).toEqual(parse('en-Latn-US-u-cu-usd'));

  // Pass language tag
  expect(addLikelySubtags(parse('und-US'))).toEqual(parse('en-Latn-US'));
});

test('remove likely subtags', () => {
  expect(removeLikelySubtags('fr-FR')).toEqual(parse('fr'));
  expect(removeLikelySubtags('en-Latn-US')).toEqual(parse('en'));

  expect(removeLikelySubtags('zh-Hant-CN')).toEqual(parse('zh-Hant-CN'));
  expect(removeLikelySubtags('zh-Hans-CN')).toEqual(parse('zh'));
  expect(removeLikelySubtags('zh-Hant-TW')).toEqual(parse('zh-TW'));

  expect(removeLikelySubtags('sr')).toEqual(parse('sr'));
  expect(removeLikelySubtags('sr-Cyrl')).toEqual(parse('sr'));
  expect(removeLikelySubtags('sr-Cyrl-RS')).toEqual(parse('sr'));

  expect(removeLikelySubtags('sr-Cyrl-BA')).toEqual(parse('sr-BA'));
  expect(removeLikelySubtags('sr-Latn-BA')).toEqual(parse('sr-Latn-BA'));
  expect(removeLikelySubtags('sr-Latn-RS')).toEqual(parse('sr-Latn'));

  expect(removeLikelySubtags('be-Cyrl-BY')).toEqual(parse('be'));
  expect(removeLikelySubtags('be-BY')).toEqual(parse('be'));
  expect(removeLikelySubtags('und-BY')).toEqual(parse('be'));

  expect(removeLikelySubtags('en-US-u-cu-usd')).toEqual(parse('en-u-cu-usd'));

  // Pass language tag
  expect(removeLikelySubtags(parse('en-Latn-US'))).toEqual(parse('en'));

});

test('aliases', () => {
  expect(LanguageResolver.substituteAliases('eng-Latn-US')).toEqual(parse('en-Latn-US'));
  expect(LanguageResolver.substituteAliases(parse('eng-Latn-US'))).toEqual(parse('en-Latn-US'));
});

import { AltType } from '@phensley/cldr-types';
import { generalApi, languageBundle, INTERNALS } from '../../_helpers';
import { parseLanguageTag, DisplayNameOptions, LanguageTag } from '../../../src';

test('languages', () => {
  let tag: LanguageTag;

  let api = generalApi('en');
  expect(api.getLanguageDisplayName('en')).toEqual('English');
  expect(api.getLanguageDisplayName('en-US')).toEqual('American English');
  expect(api.getLanguageDisplayName('es-419')).toEqual('Latin American Spanish');
  expect(api.getLanguageDisplayName('de')).toEqual('German');
  expect(api.getLanguageDisplayName('fr')).toEqual('French');
  expect(api.getLanguageDisplayName('ko')).toEqual('Korean');
  expect(api.getLanguageDisplayName('de-CH')).toEqual('Swiss High German');
  expect(api.getLanguageDisplayName('en-GB')).toEqual('British English');
  expect(api.getLanguageDisplayName('en-GB', { type: 'short' })).toEqual('UK English');
  expect(api.getLanguageDisplayName('zh-Hans')).toEqual('Simplified Chinese');
  expect(api.getLanguageDisplayName('zh-Hans', { type: 'long' })).toEqual('Simplified Mandarin Chinese');
  expect(api.getLanguageDisplayName('zh-Hant')).toEqual('Traditional Chinese');
  expect(api.getLanguageDisplayName('zh-Hant', { type: 'long' })).toEqual('Traditional Mandarin Chinese');
  expect(api.getLanguageDisplayName('yue')).toEqual('Cantonese');
  expect(api.getLanguageDisplayName('yue', { type: 'menu' })).toEqual('Chinese, Cantonese');
  expect(api.getLanguageDisplayName('zh', { type: 'menu' })).toEqual('Chinese, Mandarin');

  // unknown subtags
  expect(api.getLanguageDisplayName('en-Zzzz-ZZ')).toEqual('English');
  expect(api.getLanguageDisplayName('und-Zzzz-ZZ')).toEqual('Unknown language');

  // tags
  tag = parseLanguageTag('und');
  expect(api.getLanguageDisplayName(tag)).toEqual('Unknown language');
  tag = parseLanguageTag('en');
  expect(api.getLanguageDisplayName(tag)).toEqual('English');
  tag = parseLanguageTag('en-US');
  expect(api.getLanguageDisplayName(tag)).toEqual('American English');
  tag = parseLanguageTag('zh-Zzzz');
  expect(api.getLanguageDisplayName(tag)).toEqual('Chinese');
  tag = parseLanguageTag('zh-Hans');
  expect(api.getLanguageDisplayName(tag)).toEqual('Simplified Chinese');
  tag = parseLanguageTag('zh-Zzzz-CN');
  expect(api.getLanguageDisplayName(tag)).toEqual('Simplified Chinese');
  tag = parseLanguageTag('zh-Zzzz-TW');
  expect(api.getLanguageDisplayName(tag)).toEqual('Traditional Chinese');

  api = generalApi('es');
  expect(api.getLanguageDisplayName('en')).toEqual('Inglés');
  expect(api.getLanguageDisplayName('es-419')).toEqual('Español latinoamericano');
  expect(api.getLanguageDisplayName('de')).toEqual('Alemán');
  expect(api.getLanguageDisplayName('fr')).toEqual('Francés');
  expect(api.getLanguageDisplayName('ko')).toEqual('Coreano');

  const opts: DisplayNameOptions = { context: 'middle-of-text' };
  expect(api.getLanguageDisplayName('en', opts)).toEqual('inglés');
  expect(api.getLanguageDisplayName('de', opts)).toEqual('alemán');
  expect(api.getLanguageDisplayName('fr', opts)).toEqual('francés');
  expect(api.getLanguageDisplayName('ko', opts)).toEqual('coreano');

  api = generalApi('de');
  expect(api.getLanguageDisplayName('en')).toEqual('Englisch');
  expect(api.getLanguageDisplayName('de')).toEqual('Deutsch');
  expect(api.getLanguageDisplayName('fr')).toEqual('Französisch');
  expect(api.getLanguageDisplayName('ko')).toEqual('Koreanisch');

  api = generalApi('ko');
  expect(api.getLanguageDisplayName('en')).toEqual('영어');
  expect(api.getLanguageDisplayName('de')).toEqual('독일어');
  expect(api.getLanguageDisplayName('fr')).toEqual('프랑스어');
  expect(api.getLanguageDisplayName('ko')).toEqual('한국어');
});

test('scripts', () => {
  let tag: LanguageTag;

  let api = generalApi('en');
  expect(api.getScriptDisplayName('Latn')).toEqual('Latin');
  expect(api.getScriptDisplayName('Cyrl')).toEqual('Cyrillic');
  expect(api.getScriptDisplayName('Hant')).toEqual('Traditional');
  expect(api.getScriptDisplayName('Arab')).toEqual('Arabic');
  expect(api.getScriptDisplayName('Arab', { type: 'variant' })).toEqual('Perso-Arabic');
  expect(api.getScriptDisplayName('Cans', { type: 'short' })).toEqual('UCAS');
  expect(api.getScriptDisplayName('Zzzz')).toEqual('Unknown Script');

  // tags
  tag = parseLanguageTag('en-Zzzz');
  expect(api.getScriptDisplayName(tag)).toEqual('Latin');
  tag = parseLanguageTag('und-Zzzz');
  expect(api.getScriptDisplayName(tag)).toEqual('Unknown Script');
  tag = parseLanguageTag('en');
  expect(api.getScriptDisplayName(tag)).toEqual('Latin');
  tag = parseLanguageTag('zh-CN');
  expect(api.getScriptDisplayName(tag)).toEqual('Simplified');
  tag = parseLanguageTag('zh-TW');
  expect(api.getScriptDisplayName(tag)).toEqual('Traditional');

  api = generalApi('es');
  expect(api.getScriptDisplayName('Latn')).toEqual('Latino');
  expect(api.getScriptDisplayName('Cyrl')).toEqual('Cirílico');
  expect(api.getScriptDisplayName('Hant')).toEqual('Tradicional');
  expect(api.getScriptDisplayName('Arab')).toEqual('Árabe');
  expect(api.getScriptDisplayName('Zzzz')).toEqual('Alfabeto desconocido');

  const opts: DisplayNameOptions = { context: 'middle-of-text' };
  expect(api.getScriptDisplayName('Latn', opts)).toEqual('latino');
  expect(api.getScriptDisplayName('Cyrl', opts)).toEqual('cirílico');
  expect(api.getScriptDisplayName('Hant', opts)).toEqual('tradicional');
  expect(api.getScriptDisplayName('Arab', opts)).toEqual('árabe');
  expect(api.getScriptDisplayName('Zzzz', opts)).toEqual('alfabeto desconocido');
});

test('regions', () => {
  let tag: LanguageTag;

  let api = generalApi('en');
  expect(api.getRegionDisplayName('US')).toEqual('United States');
  expect(api.getRegionDisplayName('US', { type: 'short' })).toEqual('US');
  expect(api.getRegionDisplayName('US', { type: 'INVALID' as AltType })).toEqual('United States');

  expect(api.getRegionDisplayName('ZZ')).toEqual('Unknown Region');

  expect(api.getRegionDisplayName('DE', { type: 'variant' })).toEqual('Germany');
  expect(api.getRegionDisplayName('DE', { type: 'narrow' })).toEqual('Germany');

  // tags
  tag = parseLanguageTag('und-US');
  expect(api.getRegionDisplayName(tag)).toEqual('United States');
  tag = parseLanguageTag('und-ZZ');
  expect(api.getRegionDisplayName(tag)).toEqual('Unknown Region');
  tag = parseLanguageTag('en-ZZ');
  expect(api.getRegionDisplayName(tag)).toEqual('United States');

  api = generalApi('es');
  expect(api.getRegionDisplayName('US')).toEqual('Estados Unidos');
  expect(api.getRegionDisplayName('US', { type: 'short' })).toEqual('EE. UU.');
  expect(api.getRegionDisplayName('ZZ')).toEqual('Región desconocida');

  // Confirmation of the CLDR 44 name change for Ivory Coast
  api = generalApi('sv');
  expect(api.getRegionDisplayName('CI', { type: 'long' })).toEqual('Elfenbenskusten');
});

test('internals', () => {
  const en = languageBundle('en');
  const es = languageBundle('es');

  const { schema } = INTERNALS();
  let s: string;
  s = schema.Names.regions.displayName.get(en, 'none', '001');
  expect(s).toEqual('world');

  s = schema.Names.scripts.displayName.get(en, 'none', 'Arab');
  expect(s).toEqual('Arabic');

  s = schema.Names.regions.displayName.get(es, 'none', '001');
  expect(s).toEqual('Mundo');

  s = schema.Names.scripts.displayName.get(es, 'none', 'Arab');
  expect(s).toEqual('árabe');
});

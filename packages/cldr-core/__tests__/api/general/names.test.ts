import { languageBundle } from '../../_helpers';
import { General, GeneralImpl, InternalsImpl } from '../../../src';

const INTERNALS = new InternalsImpl();

const generalApi = (tag: string): General => {
  const bundle = languageBundle(tag);
  return new GeneralImpl(bundle, INTERNALS);
};

test('languages', () => {
  let api = generalApi('en');
  expect(api.getLanguageDisplayName('en')).toEqual('English');
  expect(api.getLanguageDisplayName('de')).toEqual('German');
  expect(api.getLanguageDisplayName('fr')).toEqual('French');
  expect(api.getLanguageDisplayName('ko')).toEqual('Korean');

  api = generalApi('es');
  expect(api.getLanguageDisplayName('en')).toEqual('inglés');
  expect(api.getLanguageDisplayName('de')).toEqual('alemán');
  expect(api.getLanguageDisplayName('fr')).toEqual('francés');
  expect(api.getLanguageDisplayName('ko')).toEqual('coreano');

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

test('territories', () => {
  let api = generalApi('en');
  expect(api.getRegionDisplayName('US')).toEqual('United States');
  expect(api.getRegionDisplayName('US', 'short')).toEqual('US');
  expect(api.getRegionDisplayName('ZZ')).toEqual('Unknown Region');

  expect(api.getRegionDisplayName('DE', 'variant')).toEqual('Germany');
  expect(api.getRegionDisplayName('DE', 'narrow')).toEqual('Germany');

  api = generalApi('es');
  expect(api.getRegionDisplayName('US')).toEqual('Estados Unidos');
  expect(api.getRegionDisplayName('US', 'short')).toEqual('EE. UU.');
  expect(api.getRegionDisplayName('ZZ')).toEqual('Región desconocida');
});

test('scripts', () => {
  let api = generalApi('en');
  expect(api.getScriptDisplayName('Latn')).toEqual('Latin');
  expect(api.getScriptDisplayName('Cyrl')).toEqual('Cyrillic');
  expect(api.getScriptDisplayName('Hant')).toEqual('Traditional');
  expect(api.getScriptDisplayName('Arab')).toEqual('Arabic');
  expect(api.getScriptDisplayName('Zzzz')).toEqual('Unknown Script');

  api = generalApi('es');
  expect(api.getScriptDisplayName('Latn')).toEqual('latino');
  expect(api.getScriptDisplayName('Cyrl')).toEqual('cirílico');
  expect(api.getScriptDisplayName('Hant')).toEqual('tradicional');
  expect(api.getScriptDisplayName('Arab')).toEqual('árabe');
  expect(api.getScriptDisplayName('Zzzz')).toEqual('alfabeto desconocido');
});

test('internals', () => {
  const en = languageBundle('en');
  const es = languageBundle('es');
  const { schema } = INTERNALS;
  let s: string;
  s = schema.Names.regions.displayName.get(en, 'none', '001');
  expect(s).toEqual('World');

  s = schema.Names.scripts.displayName.get(en, 'Arab');
  expect(s).toEqual('Arabic');

  s = schema.Names.regions.displayName.get(es, 'none', '001');
  expect(s).toEqual('Mundo');

  s = schema.Names.scripts.displayName.get(es, 'Arab');
  expect(s).toEqual('árabe');
});

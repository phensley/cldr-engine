import { EN, ES } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { GeneralEngine, GeneralInternal } from '../../../src/engine';
import { Alt } from '@phensley/cldr-schema';

const SCHEMA = buildSchema();
const INTERNAL = new GeneralInternal(SCHEMA);

test('territories', () => {
  let e = new GeneralEngine(INTERNAL, EN);
  expect(e.getTerritoryDisplayName('US')).toEqual('United States');
  expect(e.getTerritoryDisplayName('US', 'short')).toEqual('US');
  expect(e.getTerritoryDisplayName('ZZ')).toEqual('Unknown Region');

  e = new GeneralEngine(INTERNAL, ES);
  expect(e.getTerritoryDisplayName('US')).toEqual('Estados Unidos');
  expect(e.getTerritoryDisplayName('US', 'short')).toEqual('EE. UU.');
  expect(e.getTerritoryDisplayName('ZZ')).toEqual('Región desconocida');
});

test('scripts', () => {
  let e = new GeneralEngine(INTERNAL, EN);
  expect(e.getScriptDisplayName('Latn')).toEqual('Latin');
  expect(e.getScriptDisplayName('Cyrl')).toEqual('Cyrillic');
  expect(e.getScriptDisplayName('Hant')).toEqual('Traditional');
  expect(e.getScriptDisplayName('Arab')).toEqual('Arabic');
  expect(e.getScriptDisplayName('Zzzz')).toEqual('Unknown Script');

  e = new GeneralEngine(INTERNAL, ES);
  expect(e.getScriptDisplayName('Latn')).toEqual('latino');
  expect(e.getScriptDisplayName('Cyrl')).toEqual('cirílico');
  expect(e.getScriptDisplayName('Hant')).toEqual('tradicional');
  expect(e.getScriptDisplayName('Arab')).toEqual('árabe');
  expect(e.getScriptDisplayName('Zzzz')).toEqual('alfabeto desconocido');
});

test('internals', () => {
  let s: string;
  s = SCHEMA.Names.territories.displayName(EN, '001', Alt.NONE);
  expect(s).toEqual('World');

  s = SCHEMA.Names.scripts.displayName(EN, 'Arab');
  expect(s).toEqual('Arabic');

  s = SCHEMA.Names.territories.displayName(ES, '001', Alt.NONE);
  expect(s).toEqual('Mundo');

  s = SCHEMA.Names.scripts.displayName(ES, 'Arab');
  expect(s).toEqual('árabe');
});

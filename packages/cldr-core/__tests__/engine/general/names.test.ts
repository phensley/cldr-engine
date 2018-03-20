import { EN, ES } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { GeneralEngine, GeneralInternal } from '../../../src/engine';
import { Alt } from '@phensley/cldr-schema';

const SCHEMA = buildSchema();
const INTERNAL = new GeneralInternal(SCHEMA);

test('territories', () => {
  let formatter = new GeneralEngine(INTERNAL, EN);
  expect(formatter.getTerritoryDisplayName('US')).toEqual('United States');
  expect(formatter.getTerritoryDisplayName('US', 'short')).toEqual('US');

  formatter = new GeneralEngine(INTERNAL, ES);
  expect(formatter.getTerritoryDisplayName('US')).toEqual('Estados Unidos');
  expect(formatter.getTerritoryDisplayName('US', 'short')).toEqual('EE. UU.');
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

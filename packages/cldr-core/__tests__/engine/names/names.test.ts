import { EN, ES } from '../../_helpers';
import { buildSchema, NamesEngine, NamesInternal } from '../../../src';

const SCHEMA = buildSchema();
const INTERNAL = new NamesInternal(SCHEMA);

test('territories', () => {
  let formatter = new NamesEngine(INTERNAL, EN);
  expect(formatter.getTerritoryDisplayName('US')).toEqual('United States');
  expect(formatter.getTerritoryDisplayName('US', 'short')).toEqual('US');

  formatter = new NamesEngine(INTERNAL, ES);
  expect(formatter.getTerritoryDisplayName('US')).toEqual('Estados Unidos');
  expect(formatter.getTerritoryDisplayName('US', 'short')).toEqual('EE. UU.');
});

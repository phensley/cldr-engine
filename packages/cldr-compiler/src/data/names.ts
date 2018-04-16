import { Mapping, Mappings, applyMappings } from './utils';

const displayName = [
  Mappings.field('displayName').keys().remap(0, 1, 2)
];

export const transformLanguages = (o: any): any => applyMappings(o, displayName);

export const transformScripts = (o: any): any => applyMappings(o, displayName);

const territoryMappings = [
  Mappings.field('displayName').altKeys().remap(0, 2, 1, 3),
  Mappings.point('territoryIds').field('displayName').altKeys().point('1').remap(0, 2, 4)
];

export const transformTerritories = (o: any): any => applyMappings(o, territoryMappings);

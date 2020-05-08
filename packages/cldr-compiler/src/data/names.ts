import { applyMappings, Mappings } from './utils';

const languageMappings = [Mappings.field('displayName').altKeys().remap(0, 2, 1, 3)];

const scriptMappings = [Mappings.field('displayName').altKeys().remap(0, 2, 1, 3)];

const regionMappings = [
  Mappings.field('displayName').altKeys().remap(0, 2, 1, 3),
  Mappings.point('territoryIds').field('displayName').altKeys().point('1').remap(0, 2, 4),
];

export const transformLanguage = (o: any): any => applyMappings(o, languageMappings);

export const transformScript = (o: any): any => applyMappings(o, scriptMappings);

export const transformRegion = (o: any): any => applyMappings(o, regionMappings);

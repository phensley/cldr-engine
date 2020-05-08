import { applyMappings, Mapping, Mappings } from './utils';

const mappings: Mapping[] = [
  Mappings.field('metaZones').keys().keys().keys().keys().remap(0, 2, 3, 1, 4),
  Mappings.field('timeZones').keys().field('exemplarCity').remap(2, 1, 3),
  Mappings.field('gmtFormat').remap(0, 1),
  Mappings.field('hourFormat').remap(0, 1),
  Mappings.field('gmtZeroFormat').remap(0, 1),
  Mappings.field('regionFormat').remap(0, 1),

  // Extract a list of names
  Mappings.point('timeZoneIds').field('timeZones').keys().point('1').remap(0, 2, 3),
  Mappings.point('metaZoneIds').field('metaZones').keys().point('1').remap(0, 2, 3),
];

export const transformTimezones = (o: any): any => applyMappings(o, mappings);

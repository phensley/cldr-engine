import { Mapping, Mappings, applyMappings } from './utils';

const mappings: Mapping[] = [
  Mappings.field('metaZones').keys().keys().keys().keys().remap(0, 2, 3, 1, 4),
  Mappings.field('timeZones').keys().field('exemplarCity').remap(2, 1, 3),
  Mappings.field('gmtFormat').remap(0, 1),
  Mappings.field('hourFormat').remap(0, 1),
  Mappings.field('gmtZeroFormat').remap(0, 1),
  Mappings.field('regionFormat').remap(0, 1),
];

export const transformTimezones = (o: any): any => {
  const r = applyMappings(o, mappings);
  // console.log(JSON.stringify(r, undefined, '  '));
  return r;
};

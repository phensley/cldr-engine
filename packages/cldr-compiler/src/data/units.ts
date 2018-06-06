import { applyMappings, Mapping, Mappings } from './utils';

const widths = ['long', 'short', 'narrow'];

const mappings: Mapping[] = [
  Mappings.fields(widths).keys().plural('unitPattern').remap(0, 2, 3, 1, 4),
  Mappings.fields(widths).keys().field('displayName').remap(0, 2, 1, 3),
  Mappings.point('unitIds').field('names').keys().point('1').remap(0, 2, 3)
];

export const transformUnits = (o: any): any => applyMappings(o, mappings);

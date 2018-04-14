import { Mappings, applyMappings } from './utils';

const mappings = [
  Mappings.field('numberSystem').keys().field('symbols').keys().keys().remap(2, 1, 3, 4),
  Mappings.field('numberSystem').keys().field('currencyFormats')
    .field('currencySpacing').keys().keys().keys().remap(3, 1, 4, 5, 6)
];

export const transformNumbers = (o: any): any => {
  return applyMappings(o, mappings);
};

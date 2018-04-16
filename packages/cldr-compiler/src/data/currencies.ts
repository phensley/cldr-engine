import { Mappings, applyMappings } from './utils';

const mappings = [
  Mappings.keys().field('displayName').remap(1, 0, 2),
  Mappings.keys().plural('displayName', 'pluralName').remap(1, 2, 0, 3),
  Mappings.keys().alt('symbol').remap(1, 2, 0, 3),
  Mappings.point('currencyIds').keys().point('1').remap(0, 1, 2)
];

export const transformCurrencies = (o: any): any => {
  return { Currencies: applyMappings(o.Currencies, mappings) };
};

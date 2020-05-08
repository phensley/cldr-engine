import { applyMappings, Mappings } from './utils';

const mappings = [
  Mappings.field('minimumGroupingDigits').remap(0, 1),

  Mappings.field('numberSystems').keys().remap(0, 1, 2),

  Mappings.field('numberSystem').keys().field('symbols').keys().keys().remap(0, 1, 2, 3, 4),

  Mappings.field('numberSystem')
    .keys()
    .field('currencyFormats')
    .fields(['standard', 'accounting'])
    .remap(0, 1, 2, 3, 4),

  Mappings.field('numberSystem')
    .keys()
    .field('currencyFormats')
    .fields([['currencySpacing', 'spacing']])
    .fields([
      ['beforeCurrency', 'before'],
      ['afterCurrency', 'after'],
    ])
    .keys()
    .keys()
    .remap(0, 1, 2, 3, 4, 5, 6),

  Mappings.field('numberSystem')
    .keys()
    .field('currencyFormats')
    .field('short')
    .field('standard')
    .digits()
    .remap(0, 1, 2, 3, 6, 5, 7),

  Mappings.field('numberSystem').keys().field('currencyFormats').plural('unitPattern').remap(0, 1, 2, 3, 4, 5),

  Mappings.field('numberSystem').keys().field('decimalFormats').field('standard').remap(0, 1, 2, 3, 4),

  Mappings.field('numberSystem')
    .keys()
    .field('decimalFormats')
    .field('short')
    .field('decimalFormat')
    .digits()
    .remap(0, 1, 2, 3, 6, 5, 7),

  Mappings.field('numberSystem')
    .keys()
    .field('decimalFormats')
    .field('long')
    .field('decimalFormat')
    .digits()
    .remap(0, 1, 2, 3, 6, 5, 7),

  Mappings.field('numberSystem')
    .keys()
    .fields([
      ['percentFormats', 'percentFormat'],
      ['scientificFormats', 'scientificFormat'],
    ])
    .field('standard')
    .remap(0, 1, 2, 4),

  Mappings.field('numberSystem')
    .keys()
    .field('miscPatterns')
    .fields([['approximately', 'approx'], ['atLeast', 'at-least'], ['atMost', 'at-most'], 'range'])
    .remap(0, 1, 2, 3, 4),
];

export const transformNumbers = (o: any): any => applyMappings(o, mappings, false);

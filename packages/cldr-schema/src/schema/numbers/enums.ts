import { NumberSymbolType, NumberSystemCategory, NumberMiscPatternType } from '@phensley/cldr-types';

export const NumberSymbolValues: NumberSymbolType[] = [
  'currencyDecimal',
  'currencyGroup',
  'decimal',
  'exponential',
  'group',
  'infinity',
  'list',
  'minusSign',
  'nan',
  'perMille',
  'percentSign',
  'plusSign',
  'superscriptingExponent',
  'timeSeparator'
];

export const NumberSystemCategoryValues: NumberSystemCategory[] = [
  'default', 'native', 'finance', 'traditional'
];

export const NumberMiscPatternValues: NumberMiscPatternType[] = [
  'at-least', 'at-most', 'approx', 'range'
];

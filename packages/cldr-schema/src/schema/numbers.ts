import {
  CurrencySpacingPattern,
  CurrencySpacingPos,
  NumberMiscPatternType,
  NumberSymbolType,
  NumberSystemCategory
} from '@phensley/cldr-types';

import { KeyIndexImpl } from '../instructions';

export const PluralDigitValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export const CurrencySpacingPosIndex = new KeyIndexImpl<CurrencySpacingPos>(['before', 'after']);

export const CurrencySpacingPatternIndex = new KeyIndexImpl<CurrencySpacingPattern>(
  ['currencyMatch', 'surroundingMatch', 'insertBetween']
);

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

export const NumberMiscPatternIndex = new KeyIndexImpl(NumberMiscPatternValues);
export const NumberSystemsIndex = new KeyIndexImpl(NumberSystemCategoryValues);
export const NumberSymbolIndex = new KeyIndexImpl(NumberSymbolValues);

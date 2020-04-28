import {
  CurrencySpacingPattern,
  CurrencySpacingPos,
  NumberMiscPatternType,
  NumberSymbolType,
  NumberSystemCategory
} from '@phensley/cldr-types';

import { KeyIndexImpl } from '../instructions';

/**
 * @public
 */
export const PluralDigitValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

/**
 * @public
 */
export const CurrencySpacingPosIndex = new KeyIndexImpl<CurrencySpacingPos>(['before', 'after']);

/**
 * @public
 */
export const CurrencySpacingPatternIndex = new KeyIndexImpl<CurrencySpacingPattern>(
  ['currencyMatch', 'surroundingMatch', 'insertBetween']
);

/**
 * @public
 */
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

/**
 * @public
 */
export const NumberSystemCategoryValues: NumberSystemCategory[] = [
  'default', 'native', 'finance', 'traditional'
];

/**
 * @public
 */
export const NumberMiscPatternValues: NumberMiscPatternType[] = [
  'at-least', 'at-most', 'approx', 'range'
];

/**
 * @public
 */
export const NumberMiscPatternIndex = new KeyIndexImpl(NumberMiscPatternValues);

/**
 * @public
 */
export const NumberSystemsIndex = new KeyIndexImpl(NumberSystemCategoryValues);

/**
 * @public
 */
export const NumberSymbolIndex = new KeyIndexImpl(NumberSymbolValues);

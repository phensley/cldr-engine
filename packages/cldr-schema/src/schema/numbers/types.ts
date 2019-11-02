import {
  CurrencySpacingPos,
  CurrencySpacingPattern,
  NumberMiscPatternType,
  NumberSymbolType,
  NumberSystemCategory,
  NumberSystemName,
  PluralType
} from '@phensley/cldr-types';

import { DigitsArrow, FieldArrow, ScopeArrow, Vector1Arrow, Vector2Arrow } from '../arrows';

import {
  NumberMiscPatternValues,
  NumberSymbolValues,
  NumberSystemCategoryValues,
} from './enums';

import { KeyIndexImpl } from '../../instructions';

export const PluralDigitValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export const CurrencySpacingPosIndex = new KeyIndexImpl<CurrencySpacingPos>(['before', 'after']);

export const CurrencySpacingPatternIndex = new KeyIndexImpl<CurrencySpacingPattern>(
  ['currencyMatch', 'surroundingMatch', 'insertBetween']
);

export const NumberMiscPatternIndex = new KeyIndexImpl(NumberMiscPatternValues);
export const NumberSystemsIndex = new KeyIndexImpl(NumberSystemCategoryValues);
export const NumberSymbolIndex = new KeyIndexImpl(NumberSymbolValues);

export interface CurrencyFormats {
  readonly standard: FieldArrow;
  readonly accounting: FieldArrow;
  readonly short: DigitsArrow<PluralType>;
  readonly spacing: Vector2Arrow<CurrencySpacingPos, CurrencySpacingPattern>;
  readonly unitPattern: Vector1Arrow<PluralType>;
}

export interface DecimalFormats {
  readonly standard: FieldArrow;
  readonly short: DigitsArrow<PluralType>;
  readonly long: DigitsArrow<PluralType>;
}

export interface NumberSystemInfo {
  readonly symbols: Vector1Arrow<NumberSymbolType>;
  readonly currencyFormats: CurrencyFormats;
  readonly decimalFormats: DecimalFormats;
  readonly percentFormat: FieldArrow;
  readonly scientificFormat: FieldArrow;
  readonly miscPatterns: Vector1Arrow<NumberMiscPatternType>;
}

export interface NumbersSchema {
  readonly minimumGroupingDigits: FieldArrow;
  readonly numberSystems: Vector1Arrow<NumberSystemCategory>;
  readonly numberSystem: ScopeArrow<NumberSystemName, NumberSystemInfo>;
}

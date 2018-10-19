import { DigitsArrow, FieldArrow, ScopeArrow, Vector1Arrow, Vector2Arrow  } from '../arrows';
import { PluralType } from '../enums';
import {
  NumberSymbolType,
  NumberSymbolValues,
  NumberSystems,
  NumberSystemCategory,
  NumberSystemName,
  NumberSystemNameValues,
} from './enums';
import { KeyIndex } from '../../types';

export const PluralDigitValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export type CurrencySpacingPos = 'before' | 'after';

export const CurrencySpacingPosIndex = new KeyIndex<CurrencySpacingPos>(['before', 'after']);

export type CurrencySpacingPattern = 'currencyMatch' | 'surroundingMatch' | 'insertBetween';

export const CurrencySpacingPatternIndex = new KeyIndex<CurrencySpacingPattern>(
  ['currencyMatch', 'surroundingMatch', 'insertBetween']
);

export const NumberSystemsIndex = new KeyIndex(NumberSystems);
export const NumberSystemNameIndex = new KeyIndex(NumberSystemNameValues);
export const NumberSymbolIndex = new KeyIndex(NumberSymbolValues);

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
}

export interface NumbersSchema {
  readonly minimumGroupingDigits: FieldArrow;
  readonly numberSystem: ScopeArrow<NumberSystemName, NumberSystemInfo>;
  readonly numberSystems: Vector1Arrow<NumberSystemCategory>;
}

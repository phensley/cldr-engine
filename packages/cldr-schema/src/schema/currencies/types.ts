import { FieldArrow, Vector1Arrow, Vector2Arrow } from '../arrows';
import { CurrencyType, CurrencyValues } from './autogen.currencies';
import { AltIndex, AltType, PluralIndex, PluralType } from '../enums';
import { KeyIndex } from '../../types';

export const CurrencyIdIndex = new KeyIndex(CurrencyValues);

export interface CurrenciesSchema {
  readonly displayName: Vector1Arrow<CurrencyType>;
  readonly decimal: Vector1Arrow<CurrencyType>;
  readonly pluralName: Vector2Arrow<PluralType, CurrencyType>;
  readonly symbol: Vector2Arrow<AltType, CurrencyType>;
}

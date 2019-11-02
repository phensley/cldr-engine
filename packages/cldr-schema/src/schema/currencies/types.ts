import { AltType, PluralType } from '@phensley/cldr-types';
import { Vector1Arrow, Vector2Arrow } from '../arrows';
import { CurrencyType } from './autogen.currencies';

export interface CurrenciesSchema {
  readonly displayName: Vector1Arrow<CurrencyType>;
  readonly decimal: Vector1Arrow<CurrencyType>;
  readonly pluralName: Vector2Arrow<PluralType, CurrencyType>;
  readonly symbol: Vector2Arrow<AltType, CurrencyType>;
}

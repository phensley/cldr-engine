import { AltType, CurrencyType, PluralType, Vector1Arrow, Vector2Arrow } from '@phensley/cldr-types';

export interface CurrenciesSchema {
  readonly displayName: Vector1Arrow<CurrencyType>;
  readonly decimal: Vector1Arrow<CurrencyType>;
  readonly pluralName: Vector2Arrow<PluralType, CurrencyType>;
  readonly symbol: Vector2Arrow<AltType, CurrencyType>;
}

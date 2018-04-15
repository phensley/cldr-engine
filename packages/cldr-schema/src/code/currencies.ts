import { KeyIndex, Scope, scope, vector1, vector2 } from '../types';
import { AltIndex, CurrencyIdIndex, CurrencyValues, PluralIndex } from '../schema';

export const CURRENCIES: Scope = scope('Currencies', 'Currencies', [
  vector1('displayName', CurrencyIdIndex),
  vector2('pluralName', PluralIndex, CurrencyIdIndex),
  vector2('symbol', AltIndex, CurrencyIdIndex)
]);

import { scope, vector1, vector2, KeyIndex, Scope } from '../types';
import { AltIndex, CurrencyIdIndex, CurrencyValues, PluralIndex } from '../schema';

export const CURRENCIES: Scope = scope('Currencies', 'Currencies', [
  vector1('displayName', 'currency-id'),
  vector1('decimal', 'currency-id'),
  vector2('pluralName', 'plural-key', 'currency-id'),
  vector2('symbol', 'alt-key', 'currency-id')
]);

export const CURRENCIES_INDICES = {
  'currency-id': CurrencyIdIndex,
};

export const CURRENCIES_VALUES = {
  'currency-id': CurrencyValues
};

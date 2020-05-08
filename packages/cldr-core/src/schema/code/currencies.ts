import { scope, vector, Scope } from '../instructions';

export const CURRENCIES: Scope = scope('Currencies', 'Currencies', [
  vector('displayName', ['currency-id']),
  vector('decimal', ['currency-id']),
  vector('pluralName', ['plural-key', 'currency-id']),
  vector('symbol', ['alt-key', 'currency-id']),
]);

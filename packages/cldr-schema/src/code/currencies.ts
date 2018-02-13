import { Choice, ScopeMap, field, scopemap } from './instructions';
import { CurrencyValues } from '../schema/currencies';

export const CURRENCIES: ScopeMap = scopemap('Currencies', CurrencyValues, [
  field('displayName', 'displayName'),
  field('displayName', 'pluralName', Choice.PLURAL),
  field('symbol', 'symbol', Choice.ALT)
]);

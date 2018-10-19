import { digits, field, scope, scopemap, vector1, vector2, KeyIndex, Scope } from '../types';
import { PluralIndex } from '../schema';
import {
  CurrencySpacingPatternIndex,
  CurrencySpacingPosIndex,
  NumberSymbolIndex,
  NumberSystemsIndex,
  NumberSystemNameValues,
  PluralDigitValues
} from '../schema/numbers';

export const NUMBERS: Scope = scope('Numbers', 'Numbers', [

  field('minimumGroupingDigits'),
  vector1('numberSystems', 'number-system'),

  scopemap('numberSystem', 'number-system-names', [
    vector1('symbols', 'number-symbol'),

    scope('currencyFormats', 'currencyFormats', [
      field('standard'),
      field('accounting'),
      digits('short', 'plural-key', PluralDigitValues),
      vector2('spacing', 'currency-spacing-pos', 'currency-spacing-pattern'),
      vector1('unitPattern', 'plural-key')
    ]),

    scope('decimalFormats', 'decimalFormats', [
      field('standard'),
      digits('short', 'plural-key', PluralDigitValues),
      digits('long', 'plural-key', PluralDigitValues),
    ]),

    field('percentFormat'),
    field('scientificFormat')
  ])

]);

export const NUMBERS_INDICES = {
  'currency-spacing-pattern': CurrencySpacingPatternIndex,
  'currency-spacing-pos': CurrencySpacingPosIndex,
  'number-symbol': NumberSymbolIndex,
  'number-system': NumberSystemsIndex,
};

export const NUMBERS_VALUES = {
  'number-system-names': NumberSystemNameValues
};

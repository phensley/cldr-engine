import { digits, field, scope, scopemap, vector1, vector2, Scope } from '../instructions';
import {
  CurrencySpacingPatternIndex,
  CurrencySpacingPosIndex,
  NumberMiscPatternIndex,
  NumberSymbolIndex,
  NumberSystemsIndex,
  PluralDigitValues,
} from '../schema/numbers';

export const NUMBERS: Scope = scope('Numbers', 'Numbers', [

  field('minimumGroupingDigits'),
  vector1('numberSystems', 'number-system'),

  scopemap('numberSystem', 'number-system-name', [
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
    field('scientificFormat'),
    vector1('miscPatterns', 'number-misc-pattern')
  ])

]);

export const NUMBERS_INDICES = {
  'currency-spacing-pattern': CurrencySpacingPatternIndex,
  'currency-spacing-pos': CurrencySpacingPosIndex,
  'number-misc-pattern': NumberMiscPatternIndex,
  'number-symbol': NumberSymbolIndex,
  'number-system': NumberSystemsIndex,
};

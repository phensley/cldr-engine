import { digits, field, scope, scopemap, vector, Scope } from '../instructions';
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
  vector('numberSystems', ['number-system']),

  scopemap('numberSystem', 'number-system-name', [
    vector('symbols', ['number-symbol']),

    scope('currencyFormats', 'currencyFormats', [
      field('standard'),
      field('accounting'),
      digits('short', 'plural-key', PluralDigitValues),
      vector('spacing', ['currency-spacing-pos', 'currency-spacing-pattern']),
      vector('unitPattern', ['plural-key']),
    ]),

    scope('decimalFormats', 'decimalFormats', [
      field('standard'),
      digits('short', 'plural-key', PluralDigitValues),
      digits('long', 'plural-key', PluralDigitValues),
    ]),

    field('percentFormat'),
    field('scientificFormat'),
    vector('miscPatterns', ['number-misc-pattern']),
  ]),
]);

export const NUMBERS_INDICES = {
  'currency-spacing-pattern': CurrencySpacingPatternIndex,
  'currency-spacing-pos': CurrencySpacingPosIndex,
  'number-misc-pattern': NumberMiscPatternIndex,
  'number-symbol': NumberSymbolIndex,
  'number-system': NumberSystemsIndex,
};

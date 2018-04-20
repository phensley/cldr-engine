import { Scope, digits, field, scope, scopemap, vector1, vector2 } from '../types';
import { PluralIndex, Plural } from '../schema';
import {
  CurrencySpacingPosIndex,
  CurrencySpacingPatternIndex,
  DigitsIndex,
  NumberSystemsIndex,
  NumberSystemNameValues,
  NumberSymbolIndex,
} from '../schema/numbers';

const PluralDigitValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export const NUMBERS: Scope = scope('Numbers', 'Numbers', [

  field('minimumGroupingDigits'),
  vector1('numberSystems', NumberSystemsIndex),

  scopemap('numberSystem', NumberSystemNameValues, [
    vector1('symbols', NumberSymbolIndex),

    scope('currencyFormats', 'currencyFormats', [
      field('standard'),
      field('accounting'),
      digits('short', PluralIndex, PluralDigitValues),
      vector2('spacing', CurrencySpacingPosIndex, CurrencySpacingPatternIndex),
      vector1('unitPattern', PluralIndex)
    ]),

    scope('decimalFormats', 'decimalFormats', [
      field('standard'),
      digits('short', PluralIndex, PluralDigitValues),
      digits('long', PluralIndex, PluralDigitValues),
    ]),

    field('percentFormat'),
    field('scientificFormat')
  ])

]);

import { Scope, field, scope, vector1, vector2, KeyIndex } from '../types';
import { NumberSymbolValues, NumberSystemNameValues, NumberSystemTypes } from '../schema/numbers';

const NumberSystemNameIndex = new KeyIndex(NumberSystemNameValues);
const NumberSystemTypeIndex = new KeyIndex(NumberSystemTypes);
const NumberSymbolIndex = new KeyIndex(NumberSymbolValues);

export const NUMBERS2: Scope = scope('Numbers2', 'Numbers2', [

  field('minimumGroupingDigits', 'minimumGroupingDigits'),

  vector1('numberSystem', 'numberSystem', NumberSystemTypeIndex),
  vector2('symbols', 'symbols', NumberSystemNameIndex, NumberSymbolIndex)

  // vector2('currencyBefore', )
  // vector2('unitPattern', NumberSystemNameIndex, PluralIndex)
  // vector2('decimalFormatStandard', NumberSystemNameIndex)

  // vector1('percentFormat', NumberSystemNameIndex)
  // vector1('currencyStandardFormat, NumberSystemNameIndex)
  // vector1('currencyAccountingFormat, NumberSystemNameIndex)

  // vector1('scientificFormat', NumberSystemNameIndex)

  // vector3('decimalShortFormat', NumberSystemNameIndex, PluralIndex, DigitIndex)
  // vector3('decimalLongFormat', NumberSystemNameIndex, PluralIndex, DigitIndex)
  // vector3('currencyShortFormat', NumberSystemNameIndex, PluralIndex, DigitIndex)
]);

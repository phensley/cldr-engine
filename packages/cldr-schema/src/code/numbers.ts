import { Choice, Scope, digits, field, objectmap, scope, scopemap } from '../types';
import { NumberSymbolValues, NumberSystemNameValues, NumberSystemTypes } from '../schema/numbers';

const CURRENCY_SPACING = ['currencyMatch', 'surroundingMatch', 'insertBetween'];

export const NUMBERS: Scope = scope('Numbers', 'Numbers', [

  field('minimumGroupingDigits', 'minimumGroupingDigits'),
  objectmap('numberSystems', NumberSystemTypes),

  scopemap('numberSystem', NumberSystemNameValues, [

    objectmap('symbols', NumberSymbolValues),

    scope('currencyFormats', 'currencyFormats', [
      field('standard', 'standard'),
      field('accounting', 'accounting'),

      scope('short', 'short', [
        digits('standard')
      ]),

      scope('currencySpacing', 'currencySpacing', [
        objectmap('beforeCurrency', CURRENCY_SPACING),
        objectmap('afterCurrency', CURRENCY_SPACING)
      ]),

      field('unitPattern', 'unitPattern', Choice.PLURAL)
    ]),

    scope('decimalFormats', 'decimalFormats', [
      field('standard', 'standard'),

      scope('short', 'short', [
        digits('decimalFormat')
      ]),

      scope('long', 'long', [
        digits('decimalFormat')
      ])
    ]),

    scope('percentFormats', 'percentFormats', [
      field('standard', 'standard')
    ]),

    scope('scientificFormats', 'scientificFormats', [
      field('standard', 'standard')
    ])

  ])

]);

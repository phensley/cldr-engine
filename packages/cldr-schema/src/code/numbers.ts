import { Choice, Scope, digits, field, fieldmap, scope } from './instructions';
import { NumberSymbolValues } from '../schema/numbers';

export const NUMBERS: Scope = scope('Numbers', [
  fieldmap('symbols', NumberSymbolValues),

  scope('currencyFormats', [
    field('standard', 'standard'),
    field('accounting', 'accounting'),

    scope('short', [
      digits('standard')
    ]),

    field('unitPattern', 'unitPattern', Choice.PLURAL)
  ]),

  scope('decimalFormats', [
    field('standard', 'standard'),

    scope('short', [
      digits('decimalFormat')
    ]),

    scope('long', [
      digits('decimalFormat')
    ])
  ]),

  scope('percentFormats', [
    field('standard', 'standard')
  ])
]);

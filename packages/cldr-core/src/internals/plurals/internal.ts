import { PluralType } from '@phensley/cldr-schema';
import { NumberOperands } from '@phensley/decimal';

import { PluralInternals } from '../../internals/internals';
import { cardinalRules, expressions, ordinalRules } from './autogen.rules';
import { PluralRules } from './types';

const pluralRules = new PluralRules(expressions, cardinalRules, ordinalRules);

export class PluralInternalsImpl implements PluralInternals {

  cardinal(language: string, operands: NumberOperands): PluralType {
    return pluralRules.cardinal(language, operands);
  }

  ordinal(language: string, operands: NumberOperands): PluralType {
    return pluralRules.ordinal(language, operands);
  }

}

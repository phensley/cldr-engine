import { PluralType } from '@phensley/cldr-schema';
import { PluralInternals } from '..';
import { cardinalRules, expressions, ordinalRules } from './autogen.rules';
import { PluralRules } from './types';
import { NumberOperands } from '../../types/numbers';

const pluralRules = new PluralRules(expressions, cardinalRules, ordinalRules);

export class PluralInternalsImpl implements PluralInternals {

  cardinal(language: string, operands: NumberOperands): PluralType {
    return pluralRules.cardinal(language, operands);
  }

  ordinal(language: string, operands: NumberOperands): PluralType {
    return pluralRules.ordinal(language, operands);
  }

}

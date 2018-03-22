import { PluralInternals } from '..';
import { expressions, cardinalRules, ordinalRules } from './autogen.rules';
import { PluralRules } from './types';
import { NumberOperands } from '../../types/numbers';

const pluralRules = new PluralRules(expressions, cardinalRules, ordinalRules);

export class PluralInternalsImpl implements PluralInternals {

  cardinal(language: string, operands: NumberOperands): number {
    return pluralRules.cardinal(language, operands);
  }

  ordinal(language: string, operands: NumberOperands): number {
    return pluralRules.ordinal(language, operands);
  }

}

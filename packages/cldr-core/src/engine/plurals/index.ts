import { expressions, cardinalRules, ordinalRules } from './autogen.rules';
import { NumberOperands } from './operands';
import { PluralRules } from './types';
export { NumberOperands } from './operands';

const pluralRules = new PluralRules(expressions, cardinalRules, ordinalRules);

export const pluralCardinal = (language: string, operands: NumberOperands): number => {
  return pluralRules.cardinal(language, operands);
};

export const pluralOrdinal = (language: string, operands: NumberOperands): number => {
  return pluralRules.ordinal(language, operands);
};

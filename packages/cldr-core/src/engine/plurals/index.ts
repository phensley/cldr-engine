import { expressions, cardinalRules, ordinalRules } from './autogen.rules';
import { PluralRules } from './types';
import { NumberOperands } from '../../types/numbers';

const pluralRules = new PluralRules(expressions, cardinalRules, ordinalRules);

export const pluralCardinal = (language: string, operands: NumberOperands): number => {
  return pluralRules.cardinal(language, operands);
};

export const pluralOrdinal = (language: string, operands: NumberOperands): number => {
  return pluralRules.ordinal(language, operands);
};

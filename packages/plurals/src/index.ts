import { cardinalRules, expressions, ordinalRules } from './autogen.rules';
export { NumberOperands } from './operands';
import { PluralRules } from './types';

export const pluralRules = new PluralRules(expressions, cardinalRules, ordinalRules);

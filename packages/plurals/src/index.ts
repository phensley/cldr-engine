import { cardinalRules, expressions, ordinalRules } from './autogen.rules';
import { PluralRules } from './types';

export { NumberOperands as NumberOperands2 } from './operands';

export const pluralRules = new PluralRules(expressions, cardinalRules, ordinalRules);

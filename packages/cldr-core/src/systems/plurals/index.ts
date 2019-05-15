import { cardinalRules, expressions, ordinalRules } from './autogen.rules';
import { PluralRules } from './types';

export const pluralRules = new PluralRules(expressions, cardinalRules, ordinalRules);

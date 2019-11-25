import { cardinalRules, expressions, ordinalRules } from './autogen.rules';
export { NumberOperands } from './operands';
import { PluralRules } from './rules';
import { Rule, RuleMap } from './types';

const resolve = (r: RuleMap, language: string, region?: string): Rule[] =>
(region ? r[`${language}-${region}`] : undefined) || r[language] || r.root;

export class Plurals {

/**
 * Get the plural rules for a given language and optional region.
 */
get(language: string, region?: string): PluralRules {
  const cardinals = resolve(cardinalRules, language, region);
  const ordinals = resolve(ordinalRules, language, region);
  return new PluralRules(expressions, cardinals, ordinals);
}

}
export const pluralRules = new Plurals();

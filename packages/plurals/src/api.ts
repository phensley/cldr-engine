import { cardinalRules, expressions, ordinalRules } from './autogen.rules';
import { pluralRanges } from './autogen.ranges';
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
      const ranges = pluralRanges[language] || pluralRanges.en;
      return new PluralRules(expressions, cardinals, ordinals, ranges);
    }

}
export const pluralRules = new Plurals();

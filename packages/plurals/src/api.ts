import { cardinalRules, expressions, ordinalRules } from './autogen.rules';
import { pluralRanges } from './autogen.ranges';
import { PluralRules, PluralRulesImpl } from './rules';
import type { Rule, RuleMap } from './types';

const resolve = (r: RuleMap, language: string, region?: string): Rule[] =>
  (region ? r[`${language}-${region}`] : undefined) || r[language] || r.root;

/**
 * Global instance for fetching plural rules by language and region.
 *
 * @public
 */
export class Plurals {
  /**
   * Get the plural rules for a given language and optional region.
   */
  get(language: string, region?: string): PluralRules {
    const cardinals = resolve(cardinalRules, language, region);
    const ordinals = resolve(ordinalRules, language, region);
    const ranges = pluralRanges[language] || pluralRanges.en;
    return new PluralRulesImpl(expressions, cardinals, ordinals, ranges);
  }
}

/**
 * Global instance for fetching plural rules by language and region.
 *
 * @public
 */
export const pluralRules = new Plurals();

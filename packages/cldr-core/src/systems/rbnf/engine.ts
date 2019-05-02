import { Decimal } from '@phensley/decimal';
import { RBNFRule } from './types';

export type RBNFRuleGroup = RBNFRule[];

/**
 * A closed set of RBNF rules. By "closed" we mean that any instruction
 * that jumps to another rule always lands a sibling rule.
 */
export class RBNFRuleSet {

  private groupmap: Map<string, number> = new Map<string, number>();

  constructor(
    /**
     * Public names corresponding one of the rule groups. The encoder ensures
     * that the first N rules will correspond 1:1 with a public name.
     */
    groups: string[],

    /**
     * Groups of rules, some which are private.
     */
    readonly rules: RBNFRuleGroup[]) {
      groups.forEach((group, i) => {
        this.groupmap.set(group, i);
      });
    }

  /**
   * Fetch a group of rules by name.
   */
  get(name: string): RBNFRuleGroup | undefined {
    const i = this.groupmap.get(name);
    return i === undefined ? i : this.rules[i];
  }
}

/**
 * Evaluate rules to format numbers using RBNF.
 *
 * Some rulesets will be included with the core library (those referenced in the
 * root locale) while others will be added to the corresponding language's resource
 * pack and only available when that language has been loaded.
 */
export class RBNFEvaluator {

  constructor(readonly ruleset: RBNFRuleSet) { }

  format(n: Decimal, name: string): string {
    const rules = this.ruleset.get(name);
    if (rules) {
      //
    }
    console.log(n, name);
    return '';
  }

}

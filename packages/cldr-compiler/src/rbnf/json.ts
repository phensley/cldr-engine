// Structure of our patch-generated JSON, derived from the CLDR common/rbnf XML files.

export type JSONRootKey = keyof JSONRoot;

export const ROOT_KEYS: JSONRootKey[] = ['NumberingSystemRules', 'OrdinalRules', 'SpelloutRules'];

/**
 * Represents RBNF rules in the raw JSON format extracted from the CLDR.
 */
export interface JSONRoot {
  NumberingSystemRules?: JSONRuleset;
  OrdinalRules?: JSONRuleset;
  SpelloutRules?: JSONRuleset;
}

export interface JSONRuleset {
  [name: string]: JSONRulesetInner;
}

export interface JSONRulesetInner {
  private: number;
  rules: JSONRule[];
}

export interface JSONRule {
  rule: string;
  value: string;
}

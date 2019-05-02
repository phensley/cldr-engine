import { Decimal } from '@phensley/decimal';
// import { PluralType } from '@phensley/cldr-schema';

// Notation for categories in compact plural rules
// const CATEGORIES: PluralType[] = [
//   'zero', 'one', 'two', 'few', 'many', 'other'
// ];

// Types for encoding RBNF rules as compactly as possible, removing ambiguity,
// i.e. we encode the rules so as to minimize the guesswork at runtime.
//
// These types represent decoded, evaluatable rules and instructions.

/**
 * Types of rules.
 */
export const enum RuleType {
  MINUS,
  PROPER_FRACTION,
  IMPROPER_FRACTION,
  NORMAL,
  NORMAL_RADIX
}

/**
 * An atom rule has a type and one or more instructions to evaluate.
 */
export interface AtomRule {
  [0]: RuleType.MINUS | RuleType.PROPER_FRACTION | RuleType.IMPROPER_FRACTION;
  // array of instructions to evaluate
  [1]: RBNFInst[];
}

/**
 * A normal rule has a base value and one or more instructions to evaluate.
 */
export interface NormalRule {
  [0]: RuleType.NORMAL;
  // base value (implicit radix)
  [1]: Decimal;
  // instructions to evaluate
  [2]: RBNFInst[];
}

/**
 * A normal radix rule has a base value, a radix, and one or more instructions to evaluate.
 */
export interface NormalRadixRule {
  [0]: RuleType.NORMAL_RADIX;
  // base value
  [1]: Decimal;
  // explicit radix
  [2]: Decimal;
  // instructions to evaluate
  [3]: RBNFInst[];
}

export type RBNFRule = AtomRule | NormalRule | NormalRadixRule;

/**
 * Instruction opcodes.
 */
export const enum Opcode {
  LITERAL,
  APPLY_LEFT_RULE,
  APPLY_LEFT_NUM_FORMAT,
  APPLY_LEFT_2_RULE,
  APPLY_LEFT_2_NUM_FORMAT,
  APPLY_RIGHT_RULE,
  APPLY_RIGHT_NUM_FORMAT,
  SUB_LEFT,
  SUB_RIGHT,
  SUB_RIGHT_3,
  NUM_FORMAT,
  UNCHANGED_RULE,
  UNCHANGED_NUM_FORMAT,
  CARDINAL,
  ORDINAL,
  OPTIONAL,
}

export interface LiteralInst {
  [0]: Opcode.LITERAL;
  // offset into symbol table
  [1]: number;
}

export interface ApplyLeftRuleInst {
  [0]: Opcode.APPLY_LEFT_RULE;
  // offset into ruleset array
  [1]: number;
}

export interface ApplyLeft2RuleInst {
  [0]: Opcode.APPLY_LEFT_2_RULE;
  // offset into ruleset array
  [1]: number;
}

export interface ApplyRightRuleInst {
  [0]: Opcode.APPLY_RIGHT_RULE;
  // offset into ruleset array
  [1]: number;
}

export interface UnchangedRuleInst {
  [0]: Opcode.UNCHANGED_RULE;
  // offset into ruleset array
  [1]: number;
}

export interface UnchangedNumFormatInst {
  [0]: Opcode.UNCHANGED_NUM_FORMAT;
  // offset into symbol table for number format
  [1]: number;
}

/**
 * A block of rules that is optionally evaluated based on
 * some condition.
 */
export interface OptionalInst {
  [0]: Opcode.OPTIONAL;
  [1]: RBNFInst[];
}

/**
 * A substitution in a plural rule. Has a category and substition string.
 */
export interface PluralSub {
  // offset into plural categories array
  [0]: number;
  // offset into symbol table
  [1]: number;
}

export interface CardinalInst {
  [0]: Opcode.CARDINAL;
  [1]: PluralSub[];
}

export interface OrdinalInst {
  [0]: Opcode.ORDINAL;
  [1]: PluralSub[];
}

export type RBNFInst = LiteralInst
  | ApplyLeftRuleInst
  | ApplyRightRuleInst
  | CardinalInst
  | OrdinalInst
  ;

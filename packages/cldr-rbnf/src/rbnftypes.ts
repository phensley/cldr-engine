/**
 * Types for encoding RBNF rules as compactly as possible, removing ambiguity,
 * i.e. we encode the rules so as to minimize the guesswork at runtime.
 *
 * These types represent decoded, evaluatable rules and instructions.
 */

/**
 * Types of rules.
 */
export const enum RuleType {
  MINUS = 0,
  PROPER_FRACTION = 1,
  IMPROPER_FRACTION = 2,
  NORMAL = 3,
  NORMAL_RADIX = 4,
  INFINITY = 5,
  NOT_A_NUMBER = 6
}

export type AtomType =
  RuleType.MINUS
  | RuleType.INFINITY
  | RuleType.NOT_A_NUMBER
  ;

export type FractionType =
  RuleType.PROPER_FRACTION
  | RuleType.IMPROPER_FRACTION
  ;

/**
 * An atom rule has a type and one or more instructions to evaluate.
 */
export interface AtomRule {
  readonly [0]: AtomType;
  // array of instructions to evaluate
  readonly [1]: RBNFInst[];
}

/**
 * A rule that represents a fraction and indicates the decimal point character.
 */
export interface FractionRule {
  readonly [0]: FractionType;
  // array of instructions to evaluate
  readonly [1]: RBNFInst[];
  // 0 = period, 1 = comma
  readonly [2]: number;
}

/**
 * A normal rule has a base value and one or more instructions to evaluate.
 */
export interface NormalRule {
  readonly [0]: RuleType.NORMAL;
  // instructions to evaluate
  readonly [1]: RBNFInst[];
  // index of base value (implicit radix)
  readonly [2]: number;
}

/**
 * A normal radix rule has a base value, a radix, and one or more instructions to evaluate.
 */
export interface NormalRadixRule {
  readonly [0]: RuleType.NORMAL_RADIX;
  // instructions to evaluate
  readonly [1]: RBNFInst[];
  // index of base value
  readonly [2]: number;
  // index of explicit radix
  readonly [3]: number;
}

export type RBNFRule = AtomRule | FractionRule | NormalRule | NormalRadixRule;

/**
 * Instruction opcodes, sorted from most- to least-frequent.
 */
export const enum Opcode {
  LITERAL,
  SUB_RIGHT,
  OPTIONAL,
  APPLY_RIGHT_RULE,
  SUB_LEFT,
  UNCHANGED_RULE,
  UNCHANGED_NUM_FORMAT,
  APPLY_LEFT_RULE,
  CARDINAL,
  SUB_RIGHT_3,
  ORDINAL,
  APPLY_LEFT_2_RULE,
  APPLY_RIGHT_NUM_FORMAT,
  APPLY_LEFT_NUM_FORMAT,
  APPLY_LEFT_2_NUM_FORMAT,
}

// Syntax: literal string occurring between substitutions
export interface LiteralInst {
  readonly [0]: Opcode.LITERAL;
  // offset into symbol table
  readonly [1]: number;
}

// Syntax: <%rulename<
export interface ApplyLeftRuleInst {
  readonly [0]: Opcode.APPLY_LEFT_RULE;
  // offset into ruleset array
  readonly [1]: number;
}

// Syntax:  <#,##0<
export interface ApplyLeftNumFormatInst {
  readonly [0]: Opcode.APPLY_LEFT_NUM_FORMAT;
  // offset into symbol table
  readonly [1]: number;
}

// Syntax:  <%rulename<<
export interface ApplyLeft2RuleInst {
  readonly [0]: Opcode.APPLY_LEFT_2_RULE;
  // offset into ruleset array
  readonly [1]: number;
}

// Syntax:  <#,##0<<
export interface ApplyLeft2NumFormatInst {
  readonly [0]: Opcode.APPLY_LEFT_2_NUM_FORMAT;
  // offset into symbol table
  readonly [1]: number;
}

// Syntax:  >%rulename>
export interface ApplyRightRuleInst {
  readonly [0]: Opcode.APPLY_RIGHT_RULE;
  // offset into ruleset array
  readonly [1]: number;
}

// Syntax:  >#,##0>
export interface ApplyRightNumFormatInst {
  readonly [0]: Opcode.APPLY_RIGHT_NUM_FORMAT;
  // offset into symbol table
  readonly [1]: number;
}

// Syntax:  <<
export interface SubLeftInst {
  readonly [0]: Opcode.SUB_LEFT;
}

// Syntax:  >>
export interface SubRightInst {
  readonly [0]: Opcode.SUB_RIGHT;
}

// Syntax:  >>>
export interface SubRight3Inst {
  readonly [0]: Opcode.SUB_RIGHT_3;
}

// Syntax:  =%rulename=
export interface UnchangedRuleInst {
  readonly [0]: Opcode.UNCHANGED_RULE;
  // offset into ruleset array
  readonly [1]: number;
}

// Syntax:  =#,##0=
export interface UnchangedNumFormatInst {
  readonly [0]: Opcode.UNCHANGED_NUM_FORMAT;
  // offset into symbol table for number format
  readonly [1]: number;
}

/**
 * A block of rules that is optionally evaluated based on
 * some condition.
 * Syntax:  [...]
 */
export interface OptionalInst {
  readonly [0]: Opcode.OPTIONAL;
  // nested optional instructions to evaluate
  readonly [1]: RBNFInst[];
}

/**
 * A substitution in a plural rule. Has a category and substition string.
 * Syntax:  one{st}
 */
export interface PluralSub {
  // offset into plural categories array
  readonly [0]: number;
  // offset into symbol table
  readonly [1]: number;
}

// Syntax:  $(cardinal,one{Billiard}other{Billiarden})$
export interface CardinalInst {
  // cardinal plural type
  readonly [0]: Opcode.CARDINAL;
  // literal substitutions for each plural category
  readonly [1]: PluralSub[];
}

// Syntax:  $(ordinal,one{st}two{nd}few{rd}other{th})$
export interface OrdinalInst {
  // ordinal plural type
  readonly [0]: Opcode.ORDINAL;
  // literal substitutions for each plural category
  readonly [1]: PluralSub[];
}

export type RBNFInst = LiteralInst
  | ApplyLeftRuleInst
  | ApplyLeftNumFormatInst
  | ApplyLeft2RuleInst
  | ApplyLeft2NumFormatInst
  | ApplyRightRuleInst
  | ApplyRightNumFormatInst
  | CardinalInst
  | OrdinalInst
  | OptionalInst
  | SubLeftInst
  | SubRightInst
  | SubRight3Inst
  | UnchangedRuleInst
  | UnchangedNumFormatInst
  ;

// Mapping from string name of plural category to rbnf equivalent
export const PLURALS: { [x: string]: number } = {
  zero: 0,
  one: 1,
  two: 2,
  few: 3,
  many: 4,
  other: 5
};

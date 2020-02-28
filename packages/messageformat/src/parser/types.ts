/**
 * Argument reference inside a message instruction.
 *
 * @public
 */
export type Argument = string | number;

/**
 * Type of a message instruction.
 *
 * @public
 */
export const enum MessageOpType {
  TEXT = 0,
  ARG = 1,
  PLURAL = 2,
  SELECT = 3,
  BLOCK = 4,
  NOOP = 5,
  SIMPLE = 6,
  ARGSUB = 7
}

/**
 * Instruction representing "no operation".
 *
 * @public
 */
export interface MessageNoopCode {
  [0]: MessageOpType.NOOP;
}

/**
 * Instruction representing an argument.
 *
 * @public
 */
export interface MessageArgCode {
  [0]: MessageOpType.ARG;
  [1]: Argument;
}

/**
 * Instruction representing an argument substitution.
 *
 * @public
 */
export interface MessageArgSubCode {
  [0]: MessageOpType.ARGSUB;
}

/**
 * Instruction representing static text.
 *
 * @public
 */
export interface MessageTextCode {
  [0]: MessageOpType.TEXT;
  [1]: string;
}

/**
 * Instruction representing a block of instructions.
 *
 * @public
 */
export interface MessageBlockCode {
  [0]: MessageOpType.BLOCK;
  [1]: MessageCode[];
}

// PLURALS

/**
 * Type of a plural instruction.
 *
 * @public
 */
export const enum PluralNumberType {
  CARDINAL = 0,
  ORDINAL = 1
}

/**
 * Instruction representing a plural formatter.
 *
 * @public
 */
export interface MessagePluralCode {
  [0]: MessageOpType.PLURAL;
  [1]: Argument[];
  [2]: number; // offset
  [3]: PluralNumberType; // cardinal | ordinal
  [4]: PluralChoice[];
}

/**
 * Type of plural choice match.
 *
 * @public
 */
export const enum PluralChoiceType {
  EXACT = 0,
  CATEGORY = 1
}

/**
 * Instruction representing a plural exact choice.
 *
 * @public
 */
export interface PluralExactChoice {
  [0]: PluralChoiceType.EXACT;
  [1]: string;
  [2]: MessageCode;
}

/**
 * Instruction representing a plural category choice.
 *
 * @public
 */
export interface PluralCategoryChoice {
  [0]: PluralChoiceType.CATEGORY;
  [1]: string;
  [2]: MessageCode;
}

/**
 * Type of plural choice instruction.
 *
 * @public
 */
export type PluralChoice = PluralExactChoice | PluralCategoryChoice;

// SELECT

/**
 * Instruction representing a select formatter.
 *
 * @public
 */
export interface MessageSelectCode {
  [0]: MessageOpType.SELECT;
  [1]: Argument[]; // argument to compare
  [2]: SelectChoice[];
}

/**
 * Choice in a select formatter.
 *
 * @public
 */
export interface SelectChoice {
  [0]: string; // match value
  [1]: MessageCode; // body
}

// SIMPLE

/**
 * Instruction representing a custom user-defined formatter.
 *
 * User can plugin formatters that accept 1 or more arguments
 * and zero or more options.
 *
 * @public
 */
export interface MessageSimpleCode {
  [0]: MessageOpType.SIMPLE;
  [1]: string; // name
  [2]: Argument[];
  [3]: string[]; // style / options
}

/**
 * Type of a message instruction.
 *
 * @public
 */
export type MessageCode =
  MessageArgCode |
  MessageTextCode |
  MessagePluralCode |
  MessageBlockCode |
  MessageSelectCode |
  MessageSimpleCode |
  MessageArgSubCode |
  MessageNoopCode;

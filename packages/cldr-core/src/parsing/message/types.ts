import { Decimal } from '@phensley/decimal';

export const enum Chars {
  LEFT = '{',
  RIGHT = '}',
  APOS = "'",
  SEMI = ';',
  POUND = '#'
}

export type Argument = string | number;

export const enum MessageNodeType {
  TEXT = 0,
  ARG = 1,
  PLURAL = 2,
  BLOCK = 3,
  NOOP = 4,
  SELECT = 5
}

export interface NoopNode {
  [0]: MessageNodeType.NOOP;
}

export interface ArgsNode {
  [0]: MessageNodeType.ARG;
  [1]: Argument;
}

export interface TextNode {
  [0]: MessageNodeType.TEXT;
  [1]: string;
}

export interface BlockNode {
  [0]: MessageNodeType.BLOCK;
  [1]: MessageNode[];
}

// PLURALS

export const enum PluralType {
  CARDINAL = 0,
  ORDINAL = 1
}

export interface PluralNode {
  [0]: MessageNodeType.PLURAL;
  [1]: Argument;
  [2]: number; // offset
  [3]: PluralType; // cardinal | ordinal
  [4]: PluralChoice[];
}

export const enum PluralChoiceType {
  EXACT = 0,
  CATEGORY = 1
}

export interface PluralExactChoice {
  [0]: PluralChoiceType.EXACT;
  [1]: Decimal;
  [2]: MessageNode;
}

export interface PluralCategoryChoice {
  [0]: PluralChoiceType.CATEGORY;
  [1]: string;
  [2]: MessageNode;
}

export type PluralChoice = PluralExactChoice | PluralCategoryChoice;

// SELECT

export interface SelectNode {
  [0]: MessageNodeType.SELECT;
  [1]: SelectChoice[];
}

export interface SelectChoice {
  [0]: string;
  [1]: Argument;
  [2]: MessageNode;
}

export type MessageNode =
  ArgsNode |
  TextNode |
  PluralNode |
  BlockNode |
  SelectNode |
  NoopNode;

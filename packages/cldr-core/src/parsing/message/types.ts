import { Decimal } from '@phensley/decimal';

export type Argument = string | number;

export const enum MessageOpType {
  TEXT = 0,
  ARG = 1,
  PLURAL = 2,
  BLOCK = 3,
  NOOP = 4,
  SELECT = 5,
  DECIMAL = 6,
  DATE = 7,
  TIME = 8,
  DATETIME = 9,
  DATETIME_INTERVAL = 10,
  CURRENCY = 11
}

export interface MessageNoopCode {
  [0]: MessageOpType.NOOP;
}

export interface MessageArgsCode {
  [0]: MessageOpType.ARG;
  [1]: Argument;
}

export interface MessageTextCode {
  [0]: MessageOpType.TEXT;
  [1]: string;
}

export interface MessageBlockCode {
  [0]: MessageOpType.BLOCK;
  [1]: MessageCode[];
}

// PLURALS

export const enum PluralNumberType {
  CARDINAL = 0,
  ORDINAL = 1
}

export interface MessagePluralCode {
  [0]: MessageOpType.PLURAL;
  [1]: Argument;
  [2]: number; // offset
  [3]: PluralNumberType; // cardinal | ordinal
  [4]: PluralChoice[];
}

export const enum PluralChoiceType {
  EXACT = 0,
  CATEGORY = 1
}

export interface PluralExactChoice {
  [0]: PluralChoiceType.EXACT;
  [1]: Decimal;
  [2]: MessageCode;
}

export interface PluralCategoryChoice {
  [0]: PluralChoiceType.CATEGORY;
  [1]: string;
  [2]: MessageCode;
}

export type PluralChoice = PluralExactChoice | PluralCategoryChoice;

// SELECT

export interface MessageSelectCode {
  [0]: MessageOpType.SELECT;
  [1]: Argument; // argument to compare
  [2]: SelectChoice[];
}

export interface SelectChoice {
  [0]: string; // match value
  [1]: MessageCode; // body
}

// SIMPLE

export interface MessageDecimalCode {
  [0]: MessageOpType.DECIMAL;
  [1]: Argument;
  [2]: string;
}

export interface MessageDateCode {
  [0]: MessageOpType.DATE;
  [1]: Argument;
  [2]: string;
}

export interface MessageTimeCode {
  [0]: MessageOpType.TIME;
  [1]: Argument;
  [2]: string;
}

export interface MessageDateTimeCode {
  [0]: MessageOpType.DATETIME;
  [1]: Argument;
  [2]: string;
}

export interface MessageDateTimeIntervalCode {
  [0]: MessageOpType.DATETIME_INTERVAL;
  [1]: Argument[];
  [2]: string;
}

export interface MessageCurrencyCode {
  [0]: MessageOpType.CURRENCY;
  [1]: Argument;
  [2]: string;
}

export type MessageCode =
  MessageArgsCode |
  MessageTextCode |
  MessagePluralCode |
  MessageBlockCode |
  MessageSelectCode |
  MessageDecimalCode |
  MessageDateCode |
  MessageTimeCode |
  MessageDateTimeCode |
  MessageDateTimeIntervalCode |
  MessageCurrencyCode |
  MessageNoopCode;

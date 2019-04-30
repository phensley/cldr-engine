import { matcher } from './parser';

// Parser for RBNF rule syntax.

// PATTERNS

const P_EQUAL = matcher(/^=/);
const P_APOSTROPHE = matcher(/^'/);

const P_COMMA = matcher(/^,/);
const P_SEMICOLON = matcher(/^;/);

const P_SQ_LEFT = matcher(/^\[/);
const P_SQ_RIGHT = matcher(/^\]/);

const P_BRACE_LEFT = matcher(/^\{/);
const P_BRACE_RIGHT = matcher(/^\}/);

const P_ARROW_1_LEFT = matcher(/^\u2190/);
const P_ARROW_2_LEFT = matcher(/^\u2190\u2190/);
const P_ARROW_1_RIGHT = matcher(/^\u2192/);

const P_PLURAL_START = matcher(/^\$\(/);
const P_PLURAL_END = matcher(/^\)\$/);

const P_RULENAME = matcher(/^%?%[a-zA-Z\d-]+/);

const P_PLURAL_TYPE = matcher(/^(cardinal|ordinal)/);

const P_PLURAL_CAT = matcher(/^(other|zero|one|two|few|many)/);

const P_NUMFORMAT = matcher(/^[#,0.]+/);

// RULES

const P_SUB_LEFT = matcher(/^\u2190\u2190/)
  .map(_ => ({ kind: 'sub-left' }));

const P_SUB_RIGHT = matcher(/^\u2192\u2192/)
  .map(_ => ({ kind: 'sub-right' }));

const P_SUB_RIGHT_3 = matcher(/^\u2192\u2192\u2192/)
  .map(_ => ({ kind: 'sub-right-3' }));

const P_PLURAL_BODY = matcher(/^[^\}]+/u)
  .prefix(P_BRACE_LEFT)
  .suffix(P_BRACE_RIGHT);

const P_PLURAL_SUB = P_PLURAL_CAT.flatMap(category =>
  P_PLURAL_BODY
    .map(n => ({ category, n })));

const P_PLURAL_INNER = P_PLURAL_TYPE.flatMap(kind =>
  P_COMMA.flatMap(_ =>
    P_PLURAL_SUB.oneOrMore()
      .map(n => ({ kind, n }))));

const P_PLURALIZED = P_PLURAL_INNER
  .prefix(P_PLURAL_START)
  .suffix(P_PLURAL_END);

const P_APPLY_UNCH_RULE = P_RULENAME
  .prefix(P_EQUAL)
  .suffix(P_EQUAL)
    .map(n => ({ kind: 'apply-unch-rule', n }));

const P_APPLY_UNCH_NUMFORMAT = P_NUMFORMAT
  .prefix(P_EQUAL)
  .suffix(P_EQUAL)
    .map(n => ({ kind: 'apply-unch-numfmt', n }));

const P_APPLY_LEFT_RULE = P_RULENAME
    .prefix(P_ARROW_1_LEFT)
    .suffix(P_ARROW_1_LEFT)
    .map(n => ({ kind: 'apply-left-rule', n }));

const P_APPLY_LEFT_NUMFORMAT = P_NUMFORMAT
  .prefix(P_ARROW_1_LEFT)
  .suffix(P_ARROW_1_LEFT)
    .map(n => ({ kind: 'apply-left-numfmt', n }));

const P_APPLY_LEFT_2_RULE = P_RULENAME
  .prefix(P_ARROW_1_LEFT)
  .suffix(P_ARROW_2_LEFT)
    .map(n => ({ kind: 'apply-left-2-rule', n }));

const P_APPLY_LEFT_2_NUMFORMAT = P_NUMFORMAT
  .prefix(P_ARROW_1_LEFT)
  .suffix(P_ARROW_2_LEFT)
    .map(n => ({ kind: 'apply-left-2-numfmt', n }));

const P_APPLY_RIGHT_RULE = P_RULENAME
  .prefix(P_ARROW_1_RIGHT)
  .suffix(P_ARROW_1_RIGHT)
    .map(n => ({ kind: 'apply-right-rule', n }));

const P_APPLY_RIGHT_NUMFORMAT = P_NUMFORMAT
  .prefix(P_ARROW_1_RIGHT)
  .suffix(P_ARROW_1_RIGHT)
    .map(n => ({ kind: 'apply-right-numfmt', n }));

const P_LITERAL = matcher(/^[^\u2190\u2192%=\[\];$]+/u)
  .map(n => ({ kind: 'literal', n }));

// Rule for optional [ ... ]
const P_OPTION = P_PLURALIZED
  .or(P_SUB_RIGHT_3)
  .or(P_SUB_LEFT)
  .or(P_SUB_RIGHT)
  .or(P_APPLY_LEFT_2_RULE)
  .or(P_APPLY_LEFT_2_NUMFORMAT)
  .or(P_APPLY_LEFT_RULE)
  .or(P_APPLY_LEFT_NUMFORMAT)
  .or(P_APPLY_RIGHT_RULE)
  .or(P_APPLY_RIGHT_NUMFORMAT)
  .or(P_APPLY_UNCH_RULE)
  .or(P_APPLY_UNCH_NUMFORMAT)
  .or(P_LITERAL)
  .zeroOrMore()
    .prefix(P_SQ_LEFT)
    .suffix(P_SQ_RIGHT)
    .map(n => ({ kind: 'optional', n }));

// Main RBNF rule
const P_RULE = P_APOSTROPHE.orDefault('').flatMap(_ =>
  P_OPTION
  .or(P_PLURALIZED)
  .or(P_SUB_RIGHT_3)
  .or(P_APPLY_LEFT_2_RULE)
  .or(P_APPLY_LEFT_2_NUMFORMAT)
  .or(P_SUB_LEFT)
  .or(P_SUB_RIGHT)
  .or(P_APPLY_LEFT_RULE)
  .or(P_APPLY_LEFT_NUMFORMAT)
  .or(P_APPLY_RIGHT_RULE)
  .or(P_APPLY_RIGHT_NUMFORMAT)
  .or(P_APPLY_UNCH_RULE)
  .or(P_APPLY_UNCH_NUMFORMAT)
  .or(P_LITERAL)
  .zeroOrMore()
    .suffix(P_SEMICOLON));

export const parseRBNF = (s: string) => P_RULE.parse(s);

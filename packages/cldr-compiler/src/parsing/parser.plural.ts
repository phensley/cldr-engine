import { matcher } from './parser';

// Minimal parser for CLDR plural rules.
// https://www.unicode.org/reports/tr35/tr35-numbers.html#Language_Plural_Rules

export type RangeList = Array<number | Range>;

export class Range {
  constructor(
    public start: number,
    public end: number) {}

  compact(): string {
    return `${this.start}:${this.end}`;
  }
}

export class Expr {
  constructor(
    public operand: string,
    public modop: number,
    public relop: string,
    public rangelist: RangeList) {}

  compact(): string {
    const rangelist = this.rangelist.map(e => typeof e === 'number' ? e : e.compact()).join(',');
    return `${this.operand}${this.modop}${this.relop === '=' ? '' : '!'}:${rangelist}`;
  }
}

export class AndCondition {
  constructor(
    public expressions: Array<Expr>) {}

  compact(): string {
    return `${this.expressions.map(e => e.compact()).join('&')}`;
  }
}

export class OrCondition {
  constructor(
    public and: Array<AndCondition>) {}

  compact(): string {
    return `${this.and.map(a => a.compact()).join('|')}`;
  }
}

export class Rule {
  constructor(
    public or: OrCondition,
    public samples: string) {}

  compact(): string {
    return this.or.compact();
  }
}

const P_SPACE = matcher(/^\s*/);

const P_COMMA = matcher(/^,/).prefix(P_SPACE);

const P_AND = matcher(/^and/).prefix(P_SPACE);

const P_OR = matcher(/^or/).prefix(P_SPACE);

const P_ELLIPSES = matcher(/^\.\./).prefix(P_SPACE);

const P_OPERAND = matcher(/^[nivwft]/).prefix(P_SPACE);

const P_RELOP = matcher(/^(=|!=)/).prefix(P_SPACE);

const P_INTEGER = matcher(/^\d+/).prefix(P_SPACE)
  .map(v => parseInt(v, 10));

const P_MODOP = matcher(/^\%/).prefix(P_SPACE)
  .flatMap(() => matcher(/^\d+/).prefix(P_SPACE)
    .map(v => parseInt(v, 10)));

const P_RANGE = P_INTEGER.prefix(P_SPACE)
  .flatMap(start => P_INTEGER.prefix(P_ELLIPSES)
    .map(end => new Range(start, end)));

const P_RANGELIST = P_RANGE.or(P_INTEGER)
  .separatedBy(P_COMMA).prefix(P_SPACE);

const P_EXPR = P_OPERAND.flatMap(operand =>
  P_MODOP.orDefault(0).flatMap(modop =>
    P_RELOP.flatMap(relop =>
      P_RANGELIST
        .map(rangelist => new Expr(operand, modop, relop, rangelist)))));

const P_AND_CONDITION = P_EXPR
  .separatedBy(P_AND)
    .map(expr => new AndCondition(expr));

const P_OR_CONDITION = P_AND_CONDITION
  .separatedBy(P_OR).prefix(P_SPACE)
    .map(and => new OrCondition(and));

const P_SAMPLE = matcher(/^(@integer|@decimal).*$/u).orDefault('').prefix(P_SPACE);

const P_RULE = P_OR_CONDITION.orDefault(new OrCondition([]))
  .flatMap(or => P_SAMPLE.orDefault('')
    .map(samples => new Rule(or, samples)));

export const parsePluralRule = (s: string) => P_RULE.parse(s);

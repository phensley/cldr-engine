import { coerceDecimal, Decimal, DecimalArg } from '@phensley/decimal';
import { NumberOperands } from './operands';

// TODO: needs a bit of cleanup.

export type RuleMap = { [x: string]: PluralRule };
export type StringMap = { [x: string]: string };

export type Operand = 'n' | 'i' | 'v' | 'w' | 'f' | 't';

export const enum Op {
  N = 0,
  I = 1,
  V = 2,
  W = 4,
  F = 8,
  T = 16
}

// Notation for categories in compact plural rules
const CATEGORIES: { [x: string]: string } = {
  'A': 'zero',
  'B': 'one',
  'C': 'two',
  'D': 'few',
  'E': 'many',
  'F': 'other'
};

export class RuleCache {

  private rules: RuleMap = {};

  constructor(private strings: StringMap) { }

  get(language: string): PluralRule | undefined {
    let rule = this.rules[language];
    if (rule === undefined) {
      const raw = this.strings[language];
      if (raw === undefined) {
        return;
      }
      rule = new PluralRule(raw);
      this.rules[language] = rule;
    }
    return rule;
  }
}

/**
 * Set of all cardinal and ordinal plural rules, and the array of expression
 * fragments the rules reference.
 */
export class PluralRules {

  private expressions: PluralExpr[];

  private cardinals: RuleCache;
  private ordinals: RuleCache;

  constructor(
    private expressionsRaw: string[],
    cardinalsRaw: StringMap,
    ordinalsRaw: StringMap) {

      this.expressions = new Array(expressionsRaw.length);
      this.cardinals = new RuleCache(cardinalsRaw);
      this.ordinals = new RuleCache(ordinalsRaw);
  }

  operands(d: Decimal): NumberOperands {
    return new NumberOperands(d);
  }

  cardinal(language: string, n: DecimalArg): string {
    return this.evaluate(language, new NumberOperands(coerceDecimal(n)), this.cardinals);
  }

  ordinal(language: string, n: DecimalArg): string {
    return this.evaluate(language, new NumberOperands(coerceDecimal(n)), this.ordinals);
  }

  private evaluate(language: string, operands: NumberOperands, cache: RuleCache): string {
    let rule = cache.get(language);
    if (rule === undefined) {
      rule = cache.get('root');
    }
    if (rule !== undefined) {
      for (const cond of rule.conditions) {
        if (this.execute(operands, cond.conditions)) {
          return cond.category;
        }
      }
    }
    return 'other';
  }

  private execute(operands: NumberOperands, conditions: number[][]): boolean {
    // Evaluate each condition and OR them together.
    const len = conditions.length;
    for (let i = 0; i < len; i++) {
      const cond = conditions[i];

      // Evaluate the inner expressions and AND them together.
      let res = true;
      for (let j = 0; j < cond.length; j++) {
        const expr = this.getExpression(cond[j]);
        res = res && evaluateExpr(operands, expr);
        if (!res) {
          break;
        }
      }
      if (res) {
        return true;
      }
    }
    return false;
  }

  private getExpression(id: number): PluralExpr {
    let expr = this.expressions[id];
    if (expr === undefined) {
      const raw = this.expressionsRaw[id];
      expr = new PluralExpr(raw);
      this.expressions[id] = expr;
    }
    return expr;
  }
}

/**
 * Parses a packed plural rule, consisting of plural categories and the
 * expressions.
 */
export class PluralRule {

  readonly conditions: PluralCond[];

  constructor(raw: string) {
    this.conditions = raw.split('_').map(s => new PluralCond(s));
  }

}

/**
 * Parse a packed plural condition for a single category.
 */
export class PluralCond {

  readonly category: string;
  readonly conditions: number[][];

  constructor(raw: string) {
    const parts = raw.split('|');
    this.category = CATEGORIES[parts[0]];
    this.conditions = parts.slice(1).map(o => o.split('&').map(Number));
  }

}

/**
 * Parses a packed plural expression.
 */
export class PluralExpr {

  readonly operand: Operand;
  readonly operator: string;
  readonly mod?: number;
  readonly ranges: (number | number[])[];

  constructor(raw: string) {
    this.operand = raw[0] as Operand;
    let done = false;
    this.operator = '=';
    let mod = 0;
    let i = 1;
    while (i < raw.length) {
      const ch = raw[i];
      switch (ch) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        mod *= 10;
        mod += Number(ch);
        break;
      case '!':
        this.operator = '!';
        break;
      case ':':
        i++;
        done = true;
        break;
      }
      if (done) {
        break;
      }
      i++;
    }
    if (mod) {
      this.mod = mod;
    }

    raw = raw.substring(i);
    this.ranges = raw ? raw.split(',')
      .map(s => s.indexOf(':') === -1 ? Number(s) : s.split(':').map(x => Number(x))) : [];
  }
}

export const evaluateExpr = (operands: NumberOperands, expr: PluralExpr): boolean => {
  const { operand, ranges } = expr;
  if (!operand) {
    return false;
  }

  let n: number = operands[operand];

  // The N = X..Y syntax means N matches an integer from X to Y inclusive
  // Operand 'n' must always be compared as an integer, so if it has any non-zero decimal
  // parts we must set integer = false.
  const integer = operand === 'n' ? operands.w === 0 : true;

  if (expr.mod) {
    n = n % expr.mod;
  }

  const equals = expr.operator !== '!';
  const len = ranges.length;
  let res = false;
  for (let i = 0; i < len; i++) {
    const elem = ranges[i];
    if (typeof elem === 'number') {
      res = res || (integer && n === elem);
    } else {
      res = res || (integer && elem[0] <= n && n <= elem[1]);
    }
  }
  return equals ? res : !res;
};

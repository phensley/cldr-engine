import { coerceDecimal, Decimal, DecimalArg } from '@phensley/decimal';
import { NumberOperands } from './operands';

import { Expr, Rule } from './types';

export type RuleMap = { [x: string]: Rule[] };

export type RangeMap = number | { [x: number]: number };

export type Operand = 'n' | 'i' | 'v' | 'w' | 'f' | 't' | 'c';

// Notation for categories in compact plural rules
const CATEGORIES: string[] = ['zero', 'one', 'two', 'few', 'many', 'other'];

const arg = (n: DecimalArg, c: number = 0) => new NumberOperands(coerceDecimal(n), c);

/**
 * Plural operations for a given language.
 *
 * @public
 */
export interface PluralRules {
  operands(d: Decimal): NumberOperands;
  cardinal(n: DecimalArg, c?: number): string;
  ordinal(n: DecimalArg): string;
  range(start: DecimalArg, end: DecimalArg): string;
}

/**
 * Set of all cardinal and ordinal plural rules, and the array of expression
 * fragments the rules reference.
 *
 * @internal
 */
export class PluralRulesImpl implements PluralRules {
  constructor(
    private expressions: Expr[],
    private cardinals: Rule[],
    private ordinals: Rule[],
    private ranges: RangeMap,
  ) {}

  operands(d: Decimal): NumberOperands {
    return new NumberOperands(d);
  }

  cardinal(n: DecimalArg, c: number = 0): string {
    return CATEGORIES[this.evaluate(arg(n, c), this.cardinals)];
  }

  ordinal(n: DecimalArg): string {
    return CATEGORIES[this.evaluate(arg(n), this.ordinals)];
  }

  range(start: DecimalArg, end: DecimalArg): string {
    if (typeof this.ranges === 'number') {
      return CATEGORIES[this.ranges];
    }
    const s = this.evaluate(arg(start), this.cardinals);
    const e = this.evaluate(arg(end), this.cardinals);
    const cat = this.ranges[((1 << s) << 5) + (1 << e)];
    return CATEGORIES[cat] || 'other';
  }

  private evaluate(operands: NumberOperands, rules: Rule[]): number {
    if (rules) {
      for (const rule of rules) {
        if (this.execute(operands, rule[1])) {
          return rule[0];
        }
      }
    }
    return 5;
  }

  private execute(operands: NumberOperands, conditions: number[][]): boolean {
    // Evaluate each condition and OR them together.
    const len = conditions.length;
    for (let i = 0; i < len; i++) {
      const cond = conditions[i];

      // Evaluate the inner expressions and AND them together.
      let res = true;
      for (let j = 0; j < cond.length; j++) {
        const expr = this.expressions[cond[j]];
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
}

export const evaluateExpr = (operands: NumberOperands, expr: Expr): boolean => {
  const operand = expr[0]!;
  let n: number = operands[operand as Operand];

  // The N = X..Y syntax means N matches an integer from X to Y inclusive
  // Operand 'n' must always be compared as an integer, so if it has any non-zero decimal
  // parts we must set integer = false.
  const integer = operand === 'n' ? operands.w === 0 : true;

  const mod = expr[1];
  if (mod) {
    n = n % mod;
  }

  const ranges = expr[3];
  let res = false;
  for (let i = 0; i < ranges.length; i++) {
    const elem = ranges[i];
    if (typeof elem === 'number') {
      res = res || (integer && n === elem);
    } else {
      res = res || (integer && elem[0] <= n && n <= elem[1]);
    }
  }
  return expr[2] ? res : !res;
};

import { coerceDecimal, Decimal, DecimalArg } from '@phensley/decimal';
import { NumberOperands } from './operands';

import { Expr, Rule } from './types';

export type RuleMap = { [x: string]: Rule[] };

export type Operand = 'n' | 'i' | 'v' | 'w' | 'f' | 't';

// Notation for categories in compact plural rules
const CATEGORIES: string[] = ['zero', 'one', 'two', 'few', 'many', 'other'];

/**
 * Set of all cardinal and ordinal plural rules, and the array of expression
 * fragments the rules reference.
 */
export class PluralRules {

  constructor(
    private expressions: Expr[],
    private cardinals: Rule[],
    private ordinals: Rule[]) {
  }

  operands(d: Decimal): NumberOperands {
    return new NumberOperands(d);
  }

  cardinal(n: DecimalArg): string {
    return this.evaluate(new NumberOperands(coerceDecimal(n)), this.cardinals);
  }

  ordinal(n: DecimalArg): string {
    return this.evaluate(new NumberOperands(coerceDecimal(n)), this.ordinals);
  }

  private evaluate(operands: NumberOperands, rules: Rule[]): string {
    for (const rule of rules) {
      if (this.execute(operands, rule[1])) {
        return CATEGORIES[rule[0]];
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
  const operand = expr[0];
  if (!operand) {
    return false;
  }

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

import { Decimal, DecimalConstants } from '@phensley/decimal';
import { pluralRules } from '../plurals';
import { NormalRadixRule, NormalRule, Opcode, RuleType, RBNFInst, RBNFRule } from './rbnftypes';
import { binarySearch } from './utils';

// export const OPCODES: { [x: number]: string } = {
//   [Opcode.APPLY_LEFT_2_NUM_FORMAT]: 'APPLY_LEFT_2_NUM_FORMAT',
//   [Opcode.APPLY_LEFT_2_RULE]: 'APPLY_LEFT_2_RULE',
//   [Opcode.APPLY_LEFT_NUM_FORMAT]: 'APPLY_LEFT_NUM_FORMAT',
//   [Opcode.APPLY_LEFT_RULE]: 'APPLY_LEFT_RULE',
//   [Opcode.APPLY_RIGHT_NUM_FORMAT]: 'APPLY_RIGHT_NUM_FORMAT',
//   [Opcode.APPLY_RIGHT_RULE]: 'APPLY_RIGHT_RULE',
//   [Opcode.CARDINAL]: 'CARDINAL',
//   [Opcode.LITERAL]: 'LITERAL',
//   [Opcode.OPTIONAL]: 'OPTIONAL',
//   [Opcode.ORDINAL]: 'ORDINAL',
//   [Opcode.SUB_LEFT]: 'SUB_LEFT',
//   [Opcode.SUB_RIGHT]: 'SUB_RIGHT',
//   [Opcode.SUB_RIGHT_3]: 'SUB_RIGHT_3',
//   [Opcode.UNCHANGED_NUM_FORMAT]: 'UNCHANGED_NUM_FORMAT',
//   [Opcode.UNCHANGED_RULE]: 'UNCHANGED_RULE',
// };

// export const RULETYPES = {
//   [RuleType.IMPROPER_FRACTION]: 'IMPROPER_FRACTION',
//   [RuleType.INFINITY]: 'INFINITY',
//   [RuleType.MINUS]: 'MINUS',
//   [RuleType.NORMAL]: 'NORMAL',
//   [RuleType.NORMAL_RADIX]: 'NORMAL_RADIX',
//   [RuleType.NOT_A_NUMBER]: 'NOT_A_NUMBER',
//   [RuleType.PROPER_FRACTION]: 'PROPER_FRACTION'
// };

export const PLURALS: { [x: string]: number } = {
  zero: 0,
  one: 1,
  two: 2,
  few: 3,
  many: 4,
  other: 5
};

// const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((p, c) => {
//   p[c] = new Decimal(c);
//   return p;
// }, {} as any);

// Divisors based on the number of integer digits in the number being formatted.
// A 2-digit number's divisor will be '1e1', 3-digit '1e2' and so on.
// This table stops just past the largest base value found in the RBNF dataset.
const DIVISORS: Decimal[] = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
  .map(e => new Decimal(`1e${e}`));

const MINUS_ONE = DecimalConstants.ONE.negate();

// Extra debug symbols that are folded into a ruleset in debug mode.
interface RBNFDebug {
  allnames: string[];
}

const NOOP_DEBUG: RBNFDebug = {
  allnames: [],
};

/**
 * A closed set of RBNF rules. By "closed" we mean that any instruction
 * that jumps to another named rule always lands in the same ruleset.
 */
export class RBNFRulesets {

  readonly index: Map<string, number> = new Map<string, number>();

  constructor (
    readonly names: string[],
    readonly decimal: number,
    readonly symbols: string[],
    readonly rulesets: RBNFRule[][],
    readonly debug: RBNFDebug = NOOP_DEBUG
  ) {
    names.forEach((n, i) => this.index.set(n, i));
  }

}

/**
 * Evaluate rules to format numbers using RBNF.
 *
 * Some rulesets will be included with the core library (those referenced in the
 * root locale) while others will be added to the corresponding language's resource
 * pack and only available when that language has been loaded.
 */
export class RBNFEngine {

  private buf: string = '';
  private symbols: string[];

  constructor(
    private language: string,
    private rbnf: RBNFRulesets
  ) {
    this.symbols = rbnf.symbols;
  }

  format(n: Decimal, name: string): string {
    const i = this.rbnf.index.get(name);
    if (i === undefined) {
      throw new Error(`rule "${name}" is undefined`);
    }
    return this._format(n, i);
  }

  _format(n: Decimal, idx: number): string {
    const rules = this.rbnf.rulesets[idx];
    this._fmt(n, rules);
    return this.buf;
  }

  _fmt(n: Decimal, rules: RBNFRule[]): void {
    const i = this.match(n, rules);
    if (i !== undefined) {
      this._evalrule(n, i, rules);
    }
  }

  _evalrule(n: Decimal, ruleidx: number, rules: RBNFRule[]): void {
    const rule = rules[ruleidx];
    // console.log(RULETYPES[rule[0]]);
    switch (rule[0]) {
      case RuleType.MINUS:
        this._evalinst(n, n.abs(), n.abs(), rule[0], rule[1], rules);
        break;

      case RuleType.NOT_A_NUMBER:
        this._evalinst(n, n, n, ruleidx, rule[1], rules);
        break;

      case RuleType.INFINITY:
        this._evalinst(n, n, n, ruleidx, rule[1], rules);
        break;

      case RuleType.IMPROPER_FRACTION: {
        const a = n.toInteger();
        const b = n.abs().subtract(a.abs());
        // b = b.movePoint(b.scale());
        this._evalinst(n, a, b, ruleidx, rule[2], rules);
        break;
      }

      case RuleType.NORMAL: {
        // Divisor is based on number of digits in the rule's base value. This will
        // always be non-zero and a power of 10.
        const radix = DIVISORS[rule[1].integerDigits()];
        const [quotient, remainder] = n.divmod(radix);
        this._evalinst(n, quotient, remainder, ruleidx, rule[2], rules);
        break;
      }

      case RuleType.NORMAL_RADIX: {
        // Rule has a custom divisor.
        const [quotient, remainder] = n.divmod(rule[2]);
        this._evalinst(n, quotient, remainder, ruleidx, rule[3], rules);
        break;
      }
    }
  }

  _evalinst(n: Decimal, a: Decimal, b: Decimal, ruleidx: number, insts: RBNFInst[], rules: RBNFRule[]): void {
    const len = insts.length;
    const ruletype = rules[ruleidx][0];
    const fraction = ruletype === RuleType.IMPROPER_FRACTION || ruletype === RuleType.PROPER_FRACTION;
    for (let i = 0; i < len; i++) {
      const inst = insts[i];
      // console.log(OPCODES[inst[0]]);
      switch (inst[0]) {
        case Opcode.LITERAL:
          // console.log('>>', this.symbols[inst[1]]);
          this.symbol(inst[1]);
          break;

        case Opcode.APPLY_LEFT_2_RULE:
          // console.log(OPCODES[inst[0]], this.rbnf.debug.allnames[inst[1]]);
          this._fmt(a, this.rbnf.rulesets[inst[1]]);
          break;

        case Opcode.APPLY_RIGHT_RULE:
          if (fraction) {
            console.log('>>', b.shiftleft(b.precision()).toInteger().toString());
            this._fmt(b.shiftleft(b.precision()).toInteger(), this.rbnf.rulesets[inst[1]]);
          } else {
            // console.log(OPCODES[inst[0]], this.rbnf.debug.allnames[inst[1]]);
            this._fmt(b, this.rbnf.rulesets[inst[1]]);
          }
          break;

        case Opcode.SUB_LEFT:
          this._fmt(a, rules);
          break;

        case Opcode.SUB_RIGHT:
          if (fraction) {
            // console.log(n.toString(), a.toString(), b.toString());
            this._bydigit(b, -1, rules, true);
          } else {
            this._fmt(b, rules);
          }
          break;

        case Opcode.SUB_RIGHT_3:
          if (fraction) {
            this._bydigit(b, -1, rules, false);
          } else {
            this._evalrule(b, ruleidx - 1, rules);
          }
          break;

        case Opcode.OPTIONAL: {
          if (b.compare(DecimalConstants.ZERO) !== 0) {
            this._evalinst(n, a, b, ruleidx, inst[1], rules);
          }
          break;
        }

        case Opcode.UNCHANGED_RULE: {
          // console.log(OPCODES[inst[0]], this.rbnf.debug.allnames[inst[1]]);
          this._fmt(n, this.rbnf.rulesets[inst[1]]);
          break;
        }

        case Opcode.UNCHANGED_NUM_FORMAT: {
          this.symbol(inst[1]);
          break;
        }

        case Opcode.CARDINAL:
        case Opcode.ORDINAL: {
          const ops = n.operands();
          const cat = PLURALS[inst[0] === Opcode.CARDINAL ?
            pluralRules.cardinal(this.language, ops)
            : pluralRules.ordinal(this.language, ops)];
          for (const sub of inst[1]) {
            if (sub[0] === cat) {
              this.symbol(sub[1]);
              break;
            }
          }
          break;
        }

        default:
          // console.log('NOIMPL: ', OPCODES[inst[0]]);
          break;
      }
    }
  }

  _bydigit(n: Decimal, ruleidx: number, rules: RBNFRule[], spaces: boolean = true): void {
    let i = 0;
    while (n.compare(DecimalConstants.ZERO) !== 0) {
      if (spaces && i) {
        this.buf += ' ';
      }
      // Shift 1 left and isolate integer part for formatting.
      const q = n.shiftleft(1);
      const r = q.toInteger();
      if (ruleidx >= 0) {
        this._evalrule(r, ruleidx - 1, rules);
      } else {
        // console.log('rule:', r.toString());
        this._fmt(r, rules);
      }
      // Subtract integer part to continue
      n = q.subtract(r);
      i++;
    }
  }

  /**
   * Find the matching rule for a given number.
   */
  match(n: Decimal, rules: RBNFRule[]): number | undefined {
    let i = 0;
    const len = rules.length;

    const neg = n.isNegative();
    const int = n.isInteger();
    const finite = n.isFinite();

    for (; i < len; i++) {
      const rule = rules[i];
      // console.log(RULETYPES[rule[0]]);
      switch (rule[0]) {
        case RuleType.NOT_A_NUMBER: {
          if (n.isNaN()) {
            return i;
          }
          break;
        }

        case RuleType.INFINITY:
          if (n.isInfinity()) {
            return i;
          }
          break;

        case RuleType.MINUS: {
          if (neg) {
            return i;
          }
          break;
        }

        case RuleType.PROPER_FRACTION: {
          // fraction && ((> -1) || (< 1))
          if (rule[1] === this.rbnf.decimal && finite && !int &&
              ((neg && n.compare(MINUS_ONE) === 1) ||
              (n.compare(DecimalConstants.ONE) === -1))) {
            return i;
          }
          break;
        }

        case RuleType.IMPROPER_FRACTION: {
          if (rule[1] === this.rbnf.decimal && finite && !int) {
            return i;
          }
          break;
        }

        case RuleType.NORMAL:
        case RuleType.NORMAL_RADIX: {
          // Setting low at the first rule, binary search to locate the
          // correct rule.
          if (finite) {
            const low = this.search(n.abs(), i, rules as (NormalRule | NormalRadixRule)[]);
            if (low < i) {
              // console.log(i, low, RULETYPES[rule[0]], rule[1].toString());
              // Went past front limit, should never happen!
              throw new Error(`Malformed rules at ${i} for ${n.toString()}`);
              // return undefined;
            }
            return low;
          }
          break;
        }
      }
    }
    return undefined;
  }

  // search(n: Decimal, start: number, rules: RBNFRule[]): number {
  //   return binarySearch(rules, true, start, (e: RBNFRule): number =>
  //     (e[0] === RuleType.NORMAL || e[0] === RuleType.NORMAL_RADIX) ?
  //       e[1].compare(n) : 0
  //   );
  // }

  private search(n: Decimal, start: number, rules: (NormalRule | NormalRadixRule)[]): number {
    return binarySearch(rules, true, start, (e: (NormalRule | NormalRadixRule)): number => {
        const r = e[1].compare(n);
        // console.log(`${e[1].toString()}.compare(${n.toString()}) == ${r}`);
        return r;
      }
    );
  }

  private symbol(i: number): void {
    this.buf += this.symbols[i];
  }

}

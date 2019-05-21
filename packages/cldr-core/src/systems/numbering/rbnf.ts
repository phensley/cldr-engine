import { Decimal, DecimalConstants } from '@phensley/decimal';
// import { pluralRules } from '../plurals';
import {
  ApplyLeft2NumFormatInst,
  ApplyLeft2RuleInst,
  ApplyLeftNumFormatInst,
  ApplyLeftRuleInst,
  NormalRadixRule,
  NormalRule,
  Opcode,
  PLURALS,
  RuleType,
  RBNFInst,
  RBNFRule,
  SubLeftInst,
} from './rbnftypes';
import { binarySearch } from './utils';
import { pluralRules } from '../plurals';

// import { scaninst, scaninsts } from './debug';

const VERBOSE = true;

const log = (...s: any[]) => {
  if (VERBOSE) {
    console.log(...s);
  }
};

// Divisors based on the number of integer digits in the number being formatted.
// A 2-digit number's divisor will be '1e1', 3-digit '1e2' and so on.
// This table stops just past the largest base value found in the RBNF dataset.
const DIVISORS: Decimal[] = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
  .map(e => new Decimal(`1e${e}`));

const { ONE, ZERO } = DecimalConstants;
const MINUS_ONE = ONE.negate();
const TEN = new Decimal(10);

// Extra debug symbols that are folded into a ruleset in debug mode.
interface RBNFDebug {
  allnames: string[];
}

const NOOP_DEBUG: RBNFDebug = {
  allnames: [],
};

type IntegerSubInst = ApplyLeftRuleInst
  | ApplyLeft2RuleInst
  | ApplyLeft2NumFormatInst
  | ApplyLeftNumFormatInst
  | SubLeftInst;

/**
 * A closed set of RBNF rules. By "closed" we mean that any instruction
 * that jumps to another named rule always lands in the same ruleset.
 */
export class RBNF {

  // Lookup a ruleset index by its name
  readonly index: Map<string, number> = new Map<string, number>();

  // Indices of which rulesets are fraction rulesets
  readonly fractions: Set<number>;

  constructor(
    // Ordered array of ruleset names, match 1:1 with first N elements in rulesets array
    readonly names: string[],
    // Decimal point character: 0 = period, 1 = comma
    readonly decimal: number,
    // Array of numbers used in rules
    readonly numbers: Decimal[],
    // Array of string symbols used in rules
    readonly symbols: string[],
    // Indices of fraction rules in rulesets array
    fractions: number[],
    // Array of rulesets
    readonly rulesets: RBNFRule[][],
    // Optional debug including names for all private rules
    readonly debug: RBNFDebug = NOOP_DEBUG
  ) {
    names.forEach((n, i) => this.index.set(n, i));
    this.fractions = new Set<number>(fractions);
  }

  /**
   * Return the RBNF formatted representation of a number for the given
   * language, using the given rules.
   */
  format(language: string, rulename: string, n: Decimal): string {
    return new RBNFEngine(language, this).format(rulename, n);
  }
}

/**
 * Evaluate rules to format numbers using RBNF.
 *
 * Some rulesets will be included with the core library (those referenced in the
 * root locale) while others will be added to the corresponding language's resource
 * pack and only available when that language has been loaded.
 */
class RBNFEngine {

  private buf: string = '';
  private errors: string[] = [];

  constructor(
    private language: string,
    private rbnf: RBNF
  ) { }

  format(name: string, n: Decimal): string {
    const si = this.rbnf.index.get(name);
    if (si !== undefined) {
      this._format(n, si);
    }
    if (this.errors.length) {
      console.log(`ERRORS: ${this.errors.join('\n')}`);
    }
    return this.buf;
  }

  private _format(n: Decimal, si: number, fraction: boolean = false): void {
    // log('\n  _format:', n.toString(), si, this.rbnf.debug.allnames[si]);
    const ri = this._match(n, si);
    if (ri === -1) {
      // TODO: check for NaN and Inf, and handle by substituting symbols
      return;
    }
    const r = this.rbnf.rulesets[si][ri];
    this._evalinst(n, r[1], r, ri, si, fraction);
  }

  private _match(n: Decimal, si: number): number {
    const rules = this.rbnf.rulesets[si];
    const neg = n.isNegative();
    const int = n.isInteger();
    const fin = n.isFinite();

    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      switch (r[0]) {
        case RuleType.NOT_A_NUMBER:
          if (n.isNaN()) {
            return i;
          }
          break;

        case RuleType.INFINITY:
          if (n.isInfinity()) {
            return i;
          }
          break;

        case RuleType.MINUS:
          if (neg) {
            return i;
          }
          break;

        case RuleType.PROPER_FRACTION:
          if (!int && fin && r[2] === this.rbnf.decimal &&
            ((neg && n.compare(MINUS_ONE) === 1) || (!neg && n.compare(ONE) === -1))) {
            return i;
          }
          break;

        case RuleType.IMPROPER_FRACTION:
          // If present it always follows a proper fraction rule, catching anything that falls through
          if (!int && fin && r[2] === this.rbnf.decimal) {
            return i;
          }
          break;

        case RuleType.NORMAL:
        case RuleType.NORMAL_RADIX:
          if (fin) {
            const m = n.abs();
            const j = binarySearch(rules as (NormalRule | NormalRadixRule)[],
                true, i, (e: (NormalRule | NormalRadixRule)): number => this.rbnf.numbers[e[2]].compare(m));
            if (j < i) {
              this.errors.push(`Malformed rules in ruleset ${si} at ${i} for ${n.toString()}: got ${j}`);
              return -1;
            }
            return j;
          }
          break;
      }
    }

    return -1;
  }

  private _evalinst(n: Decimal, i: RBNFInst[], r: RBNFRule, ri: number, si: number, fraction: boolean = false): void {
    // log('BEGIN _evalinst:', n.toString(), RULETYPES[r[0]]);
    for (let j = 0; j < i.length; j++) {
      const inst = i[j];
      // scaninst(this.rbnf, inst, '   ');
      // console.log();
      switch (inst[0]) {
        case Opcode.LITERAL:
          this.symbol(inst[1]);
          break;

        case Opcode.OPTIONAL:
          // If number is not a multiple of radix, execute the optional block
          if (ZERO.compare(n.divmod(this.getradix(r))[1]) !== 0) {
            // log('OPTONAL', this.rbnf.debug.allnames[si], n.toString());
            this._evalinst(n, inst[1], r, ri, si, true);
          }
          break;

        case Opcode.CARDINAL:
        case Opcode.ORDINAL:
          const q = n.divmod(this.getradix(r))[0];
          const cat = this.plural(q.stripTrailingZeros(), inst[0] === Opcode.CARDINAL);
          // Select string matching plural category, and fall back to 'other'
          let subs = inst[1].filter(s => s[0] === cat);
          if (!subs.length) {
            subs = inst[1].filter(s => s[0] === PLURALS['other']);
          }
          if (subs.length) {
            this.symbol(subs[0][1]);
          }
          break;

        case Opcode.SUB_LEFT:
        case Opcode.APPLY_LEFT_RULE:
        case Opcode.APPLY_LEFT_2_RULE:
        case Opcode.APPLY_LEFT_NUM_FORMAT:
        case Opcode.APPLY_LEFT_2_NUM_FORMAT:
          if (r[0] === RuleType.PROPER_FRACTION || r[0] === RuleType.IMPROPER_FRACTION) {
            this.integersub(n, inst, ri, si);
          } else if (fraction || this.rbnf.fractions.has(si)) {
            const base = r[0] === RuleType.NORMAL || r[0] === RuleType.NORMAL_RADIX ? r[2] : -1;
            if (base !== -1) {
              // if (VERBOSE) {
              //   scaninst(this.rbnf, inst, '   ');
              //   console.log();
              // }
              this.numeratorsub(n, inst, base, ri, si);
            }
          } else {
            this.multipliersub(n, inst, this.getradix(r), ri, si);
          }
          break;

        case Opcode.UNCHANGED_RULE:
          this._format(n, inst[1]);
          break;

        case Opcode.UNCHANGED_NUM_FORMAT:
          this.buf += '#';
          break;

        case Opcode.SUB_RIGHT:
        case Opcode.SUB_RIGHT_3:
        case Opcode.APPLY_RIGHT_RULE:
          if (r[0] === RuleType.MINUS) {
            this._format(n.abs(), inst[0] === Opcode.APPLY_RIGHT_RULE ? inst[1] : si);
          } else if (r[0] === RuleType.PROPER_FRACTION || r[0] === RuleType.IMPROPER_FRACTION) {
            const m = n.abs();
            this.fractionsub(m.subtract(m.toInteger()), inst, ri, si);
          } else {
            this.modulussub(n, inst, this.getradix(r), ri, si);
          }
          break;

        default:
          console.log('   MISSING:', inst[0]);
          break;
      }
    }
    // log('  END _evalinst:', n.toString(), RULETYPES[r[0]]);

  }

  private symbol(i: number): void {
    // log(`sym ${i}: '${this.rbnf.symbols[i]}'`);
    this.buf += this.rbnf.symbols[i];
  }

  private fractionsub(n: Decimal, inst: RBNFInst, ri: number, si: number): void {
    const _si = inst[0] === Opcode.APPLY_RIGHT_RULE ? inst[1] : si;
    const digits = inst[0] === Opcode.SUB_RIGHT || inst[0] === Opcode.SUB_RIGHT_3 || _si === si;
    const spaces = inst[0] !== Opcode.SUB_RIGHT_3;
    // log('fractionsub():', n.toString(), OPCODES[inst[0]], ri, _si, si, digits, spaces);
    if (digits) {
      this.bydigit(n, ri, si, spaces);
    } else {
      let q = n;
      if (q.scale() > 9) {
        q = q.setScale(9);
      }
      const t = q.shiftleft(q.scale()).toInteger();
      const m = binarySearch(DIVISORS, false, 0, (e: Decimal) => {
        const r = e.compare(t);
        return r;
      });
      const d = DIVISORS[m];
      const k = this._match(d, _si);
      if (k !== -1) {
        const r = this.rbnf.rulesets[_si][k];
        // if (VERBOSE) {
        //   scaninsts(this.rbnf, r[1], '   ');
        //   console.log(`RULE: ${r} ${_si}`);
        // }
        this._evalinst(t, r[1], r, k, _si, true);
      }
    }
    // TODO:
  }

  private integersub(n: Decimal, inst: IntegerSubInst, _ri: number, si: number): void {
    n = n.toInteger();
    // log('integersub():', inst, n.toString(), ri, si);
    switch (inst[0]) {
      case Opcode.APPLY_LEFT_RULE:
      case Opcode.APPLY_LEFT_2_RULE:
      case Opcode.SUB_LEFT:
        this._format(n, inst[0] === Opcode.SUB_LEFT ? si : inst[1]);
        break;
      case Opcode.APPLY_LEFT_NUM_FORMAT:
      case Opcode.APPLY_LEFT_2_NUM_FORMAT:
        this.buf += '#';
        break;
    }
  }

  private numeratorsub(n: Decimal, inst: RBNFInst, _base: number, _ri: number, _si: number): void {
    // log(' numeratorsub():', n.toString(), OPCODES[inst[0]], this.rbnf.numbers[base].toString(), ri, si);
    switch (inst[0]) {
      case Opcode.APPLY_LEFT_2_RULE:
        this._format(n, inst[1]);
        break;
    }
  }

  private multipliersub(n: Decimal, inst: RBNFInst, radix: Decimal, _ri: number, si: number): void {
    const [q] = n.divmod(radix);
    // log('multipliersub():', q.toString(), r.toString());
    // if (VERBOSE) {
    //   scaninst(this.rbnf, inst, '   ');
    //   log();
    // }
    switch (inst[0]) {
      case Opcode.APPLY_LEFT_RULE:
      case Opcode.SUB_LEFT:
        this._format(q, inst[0] === Opcode.SUB_LEFT ? si : inst[1]);
        break;
      default:
        log('MISSING:', inst[0]);
        break;
    }
  }

  private modulussub(n: Decimal, inst: RBNFInst, radix: Decimal, _ri: number, si: number): void {
    const r = n.divmod(radix)[1];
    // log('modulussub', n.toString(), radix.toString(), '>>', r.toString(), optional);
      switch (inst[0]) {
        case Opcode.APPLY_RIGHT_RULE:
        case Opcode.SUB_RIGHT:
          this._format(r, inst[0] === Opcode.SUB_RIGHT ? si : inst[1]);
          break;
      }
  }

  private plural(n: Decimal, cardinal: boolean): number {
    const o = n.operands();
    const cat = cardinal ? pluralRules.cardinal(this.language, o) : pluralRules.ordinal(this.language, o);
    // log('MATCH PLURAL:', this.language, o, cat);
    return PLURALS[cat];
  }

  private bydigit(n: Decimal, _ri: number, si: number, spaces: boolean = true): void {
    let i = 0;
    while (ZERO.compare(n) !== 0) {
      if (spaces && i) {
        this.buf += ' ';
      }
      // Shift 1 digit to the left and isolate integer part
      // TODO: method for scanning Decimal by index
      const q = n.shiftleft(1);
      const r = q.toInteger();
      this._format(r, si);
      n = q.subtract(r);
      i++;
    }
  }

  private getradix(r: RBNFRule): Decimal {
    const n = this.rbnf.numbers;
    return r[0] === RuleType.NORMAL_RADIX ? n[r[3]] :
      r[0] === RuleType.NORMAL ? DIVISORS[n[r[2]].integerDigits()] : TEN;
  }
}

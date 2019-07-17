import { Decimal } from '@phensley/decimal';
import { Opcode, RuleType, RBNFInst, RBNFRule } from './rbnftypes';
import {
  RBNF as RBNFBase,
  RBNFEngine as RBNFEngineBase,
  RBNFSet as RBNFSetBase,
} from './rbnf';

const REVPLURALS: { [x: number]: string } = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'few',
  4: 'many',
  5: 'other'
};

export class RBNF extends RBNFBase {

  static verbose: boolean = false;

  constructor(spellout: any) {
    super(spellout);
  }

  make(id: string, pub: string[], prv: string[],
      numbers: Decimal[], symbols: string[], rulesets: RBNFRule[][]): RBNFSetBase {
    return new RBNFDebugSet(id, pub, prv, numbers, symbols, rulesets, RBNF.verbose);
  }
}

export class RBNFDebugSet extends RBNFSetBase {

  /**
   * Collect and report ruleset coverage information.
   */
  readonly coverage: Map<number, Set<number>> = new Map();

  constructor(
    id: string,
    pubnames: string[],
    prvnames: string[],
    numbers: Decimal[],
    symbols: string[],
    rulesets: RBNFRule[][],
    private verbose: boolean
  ) {
    super(id, pubnames, prvnames, numbers, symbols, rulesets);
  }

  format(language: string, rulename: string, decimal: number, n: Decimal): string {
    return new RBNFDebugEngine(language, decimal, this, this.verbose, this.coverage)
      .format(rulename, n);
  }

  report(detail: boolean = false): void {
    for (let si = 0; si < this.allnames.length; si++) {
      const name = this.allnames[si];
      const rules = this.rulesets[si];
      let pct = 0;
      let count = 0;
      const set = this.coverage.get(si);
      let rpt = '';
      for (let ri = 0; ri < rules.length; ri++) {
        if (set && set.has(ri)) {
          count++;
        } else {
          rpt += '   ' + rulerepr(this, rules[ri]) + '\n';
        }
      }
      pct = (count / rules.length) * 100;
      console.log(
        padleft(`${Math.floor(pct)}%`, 6),
        '[',
        padleft(`${count}`, 2),
        '/',
        padleft(`${rules.length}`, 2),
        ']', name
      );
      if (detail && pct < 100) {
        console.log(rpt);
      }
    }
  }
}

export const padleft = (s: string, n: number) => {
  const d = n - s.length;
  return  ' '.repeat(d > 0 ? d : 0) + s;
};

export const padright = (s: string, n: number) => {
  const d = n - s.length;
  return s + ' '.repeat(d > 0 ? d : 0);
};

type tracefunc = (...s: any[]) => void;

class RBNFDebugEngine extends RBNFEngineBase {

  private depth: number = 0;
  private id: number = 0;

  constructor(
    language: string,
    decimal: number,
    rbnf: RBNFSetBase,
    private verbose: boolean,
    private coverage: Map<number, Set<number>>
  ) {
    super(language, decimal, rbnf);
  }

  protected trace(...s: any[]): tracefunc {
    const id = `${padleft(`[${this.id}]`, 5)}`;
    const indent = '  '.repeat(this.depth);
    this.id++;
    this.depth++;
    if (this.verbose) {
      console.log(indent, id, '>>', ...s);
    }
    return (..._e: any[]) => {
      this.depth--;
    };
  }

  protected _evalinst(n: Decimal, i: RBNFInst[], r: RBNFRule, ri: number, si: number): void {
    // Collect ruleset coverage during execution
    let covered = this.coverage.get(si);
    if (!covered) {
      covered = new Set();
      this.coverage.set(si, covered);
    }
    covered.add(ri);
    const t = this.trace(
      `_evalinst '${n.toString()}' ${this.rbnf.allnames[si]} ${rulerepr(this.rbnf, r)}`);
    super._evalinst(n, i, r, ri, si);
    t('_evalinst');
  }

  protected modulussub(n: Decimal, inst: RBNFInst, radix: Decimal, _ri: number, si: number): void {
    const t = this.trace('modolussub', n.toString());
    super.modulussub(n, inst, radix, _ri, si);
    t('modulussub');
  }
}

const rulerepr = (rbnf: RBNFSetBase, rule: RBNFRule): string => {
  let res = '';
  switch (rule[0]) {
    case RuleType.IMPROPER_FRACTION:
    case RuleType.PROPER_FRACTION:
      const sym = rule[2] === 1 ? ',' : '.';
      res += `"${rule[0] === RuleType.IMPROPER_FRACTION ? 'x' : '0'}${sym}x"`;
      break;
    case RuleType.MINUS:
      res += '"-x"';
      break;
    case RuleType.INFINITY:
      res += `"Inf"`;
      break;
    case RuleType.NOT_A_NUMBER:
      res += 'NaN';
      break;
    case RuleType.NORMAL:
      res += `"${rbnf.numbers[rule[2]]}"`;
      break;
    case RuleType.NORMAL_RADIX:
      res += `"${rbnf.numbers[rule[2]]}/${rbnf.numbers[rule[3]]}"`;
      break;
    default:
      res += '!!!!!';
    }
  res += '  "' + rule[1].map(i => instrepr(rbnf, i)).join('') + ';"';
  return res;
};

const instrepr = (rbnf: RBNFSetBase, i: RBNFInst): string => {
  switch (i[0]) {
    case Opcode.APPLY_LEFT_NUM_FORMAT:
      return `<${rbnf.symbols[i[1]]}<`;
    case Opcode.APPLY_LEFT_RULE:
      return `<%${rbnf.allnames[i[1]]}%<`;
    case Opcode.APPLY_LEFT_2_NUM_FORMAT:
      return `<${rbnf.symbols[i[1]]}<<`;
    case Opcode.APPLY_LEFT_2_RULE:
      return `<%${rbnf.allnames[i[1]]}%<<`;
    case Opcode.APPLY_RIGHT_RULE:
      return `>%${rbnf.allnames[i[1]]}%>`;
    case Opcode.OPTIONAL:
      return '[' + i[1].map(_i => instrepr(rbnf, _i)).join('') + ']';
    case Opcode.LITERAL:
      return rbnf.symbols[i[1]];
    case Opcode.SUB_LEFT:
      return '<<';
    case Opcode.SUB_RIGHT:
      return '>>';
    case Opcode.SUB_RIGHT_3:
      return '>>>';
    case Opcode.UNCHANGED_NUM_FORMAT:
      return `=${rbnf.symbols[i[1]]}=`;
    case Opcode.UNCHANGED_RULE:
      return `=%${rbnf.allnames[i[1]]}%=`;
    case Opcode.CARDINAL:
    case Opcode.ORDINAL:
      const r = i[0] === Opcode.CARDINAL ? 'cardinal' : 'ordinal';
      const subs = i[1].map(s => `${REVPLURALS[s[0]]}{${rbnf.symbols[s[1]]}}`).join('');
      return `$(${r},${subs})$`;
    default:
      return OPCODES[i[0]];
  }
};

export const OPCODES: { [x: number]: string } = {
  [Opcode.APPLY_LEFT_2_NUM_FORMAT]: 'APPLY_LEFT_2_NUM_FORMAT',
  [Opcode.APPLY_LEFT_2_RULE]: 'APPLY_LEFT_2_RULE',
  [Opcode.APPLY_LEFT_NUM_FORMAT]: 'APPLY_LEFT_NUM_FORMAT',
  [Opcode.APPLY_LEFT_RULE]: 'APPLY_LEFT_RULE',
  [Opcode.APPLY_RIGHT_NUM_FORMAT]: 'APPLY_RIGHT_NUM_FORMAT',
  [Opcode.APPLY_RIGHT_RULE]: 'APPLY_RIGHT_RULE',
  [Opcode.CARDINAL]: 'CARDINAL',
  [Opcode.LITERAL]: 'LITERAL',
  [Opcode.OPTIONAL]: 'OPTIONAL',
  [Opcode.ORDINAL]: 'ORDINAL',
  [Opcode.SUB_LEFT]: 'SUB_LEFT',
  [Opcode.SUB_RIGHT]: 'SUB_RIGHT',
  [Opcode.SUB_RIGHT_3]: 'SUB_RIGHT_3',
  [Opcode.UNCHANGED_NUM_FORMAT]: 'UNCHANGED_NUM_FORMAT',
  [Opcode.UNCHANGED_RULE]: 'UNCHANGED_RULE',
};

export const RULETYPES = {
  [RuleType.IMPROPER_FRACTION]: 'IMPROPER_FRACTION',
  [RuleType.INFINITY]: 'INFINITY',
  [RuleType.MINUS]: 'MINUS',
  [RuleType.NORMAL]: 'NORMAL',
  [RuleType.NORMAL_RADIX]: 'NORMAL_RADIX',
  [RuleType.NOT_A_NUMBER]: 'NOT_A_NUMBER',
  [RuleType.PROPER_FRACTION]: 'PROPER_FRACTION'
};

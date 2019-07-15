import { Decimal } from '@phensley/decimal';
import { Opcode, RuleType, RBNFInst, RBNFRule } from './rbnftypes';
import { RBNF as RBNFBase, RBNFEngine as RBNFEngineBase } from './rbnf';

const REVPLURALS: { [x: number]: string } = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'few',
  4: 'many',
  5: 'other'
};

// Extra debug symbols that are folded into a ruleset in debug mode.
interface RBNFDebug {
  allnames: string[];
}

const NOOP_DEBUG: RBNFDebug = {
  allnames: [],
};

export class RBNF extends RBNFBase {

  constructor(
    names: string[],
    decimal: number,
    numbers: Decimal[],
    symbols: string[],
    fractions: number[],
    rulesets: RBNFRule[][],

    // Optional debug including names for all private rules
    readonly debug: RBNFDebug = NOOP_DEBUG
  ) {
    super(names, decimal, numbers, symbols, fractions, rulesets);
  }

  format(language: string, rulename: string, n: Decimal): string {
    return new RBNFDebugEngine(language, this).format(rulename, n);
  }

}

export const pad = (s: string, n: number) => {
  const d = n - s.length;
  return  ' '.repeat(d > 0 ? d : 0) + s;
};

type tracefunc = (...s: any[]) => void;

class RBNFDebugEngine extends RBNFEngineBase {

  private depth: number = 0;
  private id: number = 0;
  private allnames: string[];

  constructor(
    language: string,
    rbnf: RBNF
  ) {
    super(language, rbnf);
    this.allnames = rbnf.debug.allnames;
  }

  protected trace(...s: any[]): tracefunc {
    const id = `${pad(`[${this.id}]`, 5)}`;
    const indent = '  '.repeat(this.depth);
    this.id++;
    this.depth++;
    console.log(indent, id, '>>', ...s);
    return (...e: any[]) => {
      this.depth--;
      const a = e.length ? e : s;
      console.log(indent, id, '<<', ...a);
    };
  }

  protected _evalinst(n: Decimal, i: RBNFInst[], r: RBNFRule, ri: number, si: number, fraction: boolean = false): void {
    const insts = i.map(_i => OPCODES[_i[0]]).join(',');
    const t = this.trace(`_evalinst '${n.toString()}' ${this.allnames[si]}  rule=${RULETYPES[r[0]]} insts=${insts}`);
    super._evalinst(n, i, r, ri, si, fraction);
    t('_evalinst');
  }

  protected modulussub(n: Decimal, inst: RBNFInst, radix: Decimal, _ri: number, si: number): void {
    const t = this.trace('modolussub', n.toString());
    super.modulussub(n, inst, radix, _ri, si);
    t('modulussub');
  }

}

export const scaninst = (rbnf: RBNF, inst: RBNFInst, indent: string) => {
  const iname = OPCODES[inst[0]];
  let desc = '<NONE>';
  switch (inst[0]) {
    case Opcode.APPLY_LEFT_RULE:
    case Opcode.APPLY_LEFT_2_RULE:
    case Opcode.APPLY_RIGHT_RULE:
    case Opcode.UNCHANGED_RULE:
      desc = rbnf.debug.allnames[inst[1]];
      break;
    case Opcode.LITERAL:
      desc = `"${rbnf.symbols[inst[1]]}"`;
      break;
    case Opcode.APPLY_LEFT_NUM_FORMAT:
    case Opcode.APPLY_LEFT_2_NUM_FORMAT:
    case Opcode.APPLY_RIGHT_NUM_FORMAT:
    case Opcode.UNCHANGED_NUM_FORMAT:
      desc = `${rbnf.symbols[inst[1]]}`;
      break;
    case Opcode.SUB_LEFT:
    case Opcode.SUB_RIGHT:
    case Opcode.SUB_RIGHT_3:
      desc = '';
      break;
    case Opcode.CARDINAL:
    case Opcode.ORDINAL:
      desc = '';
      inst[1].forEach(sub => {
        desc += `${REVPLURALS[sub[0]]}{${rbnf.symbols[sub[1]]}} `;
      });
      break;
    case Opcode.OPTIONAL:
      console.log(`${indent}${iname}`);
      scaninsts(rbnf, inst[1], indent + '  ');
      break;
  }
  console.log(`${indent}${iname}  ${desc}`);
};

export const scaninsts = (rbnf: RBNF, insts: RBNFInst[], indent: string) => {
  for (const inst of insts) {
    scaninst(rbnf, inst, indent);
  }
};

export const dump = (rbnf: RBNF) => {
  const len = rbnf.rulesets.length;
  for (let i = 0; i < len; i++) {
    const ruleset = rbnf.rulesets[i];
    console.log(`%${rbnf.debug.allnames[i]}`);
    for (const rule of ruleset) {
      const rulename = RULETYPES[rule[0]];
      const insts: RBNFInst[] = rule[1];
      let desc = '';
      switch (rule[0]) {
        case RuleType.IMPROPER_FRACTION:
        case RuleType.PROPER_FRACTION:
          desc = rule[1] ? 'comma' : 'period';
          break;
        case RuleType.NORMAL:
          desc = rbnf.numbers[rule[2]].toString();
          break;
        case RuleType.NORMAL_RADIX:
          desc = `${rbnf.numbers[rule[2]].toString()}/${rbnf.numbers[rule[3]].toString()}`;
          break;
      }
      console.log(`  ${rulename} ${desc}`);
      scaninsts(rbnf, insts, '    ');
    }
    console.log();
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

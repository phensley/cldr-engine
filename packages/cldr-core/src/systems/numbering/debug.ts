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

export class RBNF extends RBNFBase {

  constructor(
    names: string[],
    decimal: number,
    numbers: Decimal[],
    symbols: string[],
    rulesets: RBNFRule[][]
  ) {
    super(names, decimal, numbers, symbols, rulesets);
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

  constructor(
    language: string,
    rbnf: RBNF
  ) {
    super(language, rbnf);
  }

  protected trace(...s: any[]): tracefunc {
    const id = `${pad(`[${this.id}]`, 5)}`;
    const indent = '  '.repeat(this.depth);
    this.id++;
    this.depth++;
    console.log(indent, id, '>>', ...s);
    return (..._e: any[]) => {
      this.depth--;
      // const a = e.length ? e : s;
      // console.log(indent, id, '<<', ...a);
    };
  }

  protected _evalinst(n: Decimal, i: RBNFInst[], r: RBNFRule, ri: number, si: number): void {
    // const insts = i.map(_i => OPCODES[_i[0]]).join(',');
    const t = this.trace(
      `_evalinst '${n.toString()}' ${this.rbnf.names[si]} ${this.rulerepr(r)}`);
    super._evalinst(n, i, r, ri, si);
    t('_evalinst');
  }

  protected modulussub(n: Decimal, inst: RBNFInst, radix: Decimal, _ri: number, si: number): void {
    const t = this.trace('modolussub', n.toString());
    super.modulussub(n, inst, radix, _ri, si);
    t('modulussub');
  }

  private rulerepr(rule: RBNFRule): string {
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
        res += `"${this.rbnf.numbers[rule[2]]}"`;
        break;
      case RuleType.NORMAL_RADIX:
        res += `"${this.rbnf.numbers[rule[2]]}/${this.rbnf.numbers[rule[3]]}"`;
        break;
      default:
        res += '!!!!!';
      }
    res += '  "' + rule[1].map(i => this.instrepr(i)).join('') + ';"';
    return res;
  }

  private instrepr(i: RBNFInst): string {
    switch (i[0]) {
      case Opcode.APPLY_LEFT_NUM_FORMAT:
        return `<${this.rbnf.symbols[i[1]]}<`;
      case Opcode.APPLY_LEFT_RULE:
        return `<%${this.rbnf.names[i[1]]}%<`;
      case Opcode.APPLY_LEFT_2_NUM_FORMAT:
        return `<${this.rbnf.symbols[i[1]]}<<`;
      case Opcode.APPLY_LEFT_2_RULE:
        return `<%${this.rbnf.names[i[1]]}%<<`;
      case Opcode.APPLY_RIGHT_RULE:
        return `>%${this.rbnf.names[i[1]]}%>`;
      case Opcode.OPTIONAL:
        return '[' + i[1].map(_i => this.instrepr(_i)).join('') + ']';
      case Opcode.LITERAL:
        return this.rbnf.symbols[i[1]];
      case Opcode.SUB_LEFT:
        return '<<';
      case Opcode.SUB_RIGHT:
        return '>>';
      case Opcode.SUB_RIGHT_3:
        return '>>>';
      case Opcode.UNCHANGED_NUM_FORMAT:
        return `=${this.rbnf.symbols[i[1]]}=`;
      case Opcode.UNCHANGED_RULE:
        return `=%${this.rbnf.names[i[1]]}%=`;
      case Opcode.CARDINAL:
      case Opcode.ORDINAL:
        const r = i[0] === Opcode.CARDINAL ? 'cardinal' : 'ordinal';
        const subs = i[1].map(s => `${REVPLURALS[s[0]]}{${this.rbnf.symbols[s[1]]}}`).join('');
        return `$(${r},${subs})$`;
      default:
        return OPCODES[i[0]];
    }
  }
}

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

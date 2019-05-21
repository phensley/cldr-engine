import { Opcode, RuleType, RBNFInst } from './rbnftypes';
import { RBNF } from './rbnf';

const REVPLURALS: { [x: number]: string } = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'few',
  4: 'many',
  5: 'other'
};

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
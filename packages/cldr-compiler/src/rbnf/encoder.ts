import { Opcode, RuleType } from '@phensley/cldr-core/lib/systems/numbering/rbnftypes';

import { parseRBNF, RBNFNode } from '../parsing/parser.rbnf';
import { JSONRoot, JSONRulesetInner, ROOT_KEYS } from './json';
import { FrequencySet } from '../utils';

// In debug mode we add debug symbols to the encoded result
const DEBUG = false;

const IGNORED = new Set(['lenient-parse']);

const PLURALS: string[] = [
  'zero', 'one', 'two', 'few', 'many', 'other'
];

/**
 * Collect all rulesets.
 */
const collect = (root: JSONRoot): [string, JSONRulesetInner][] => {
  const res: [string, JSONRulesetInner][] = [];
  for (const key of ROOT_KEYS) {
    const rulesets = root[key];
    if (!rulesets) {
      continue;
    }
    for (const name of Object.keys(rulesets)) {
      res.push([name, rulesets[name] ]);
    }
  }
  return res;
};

/**
 * Parse an RBNF rule and throw an error if the parse failed.
 */
const parse = (raw: string): RBNFNode[] => {
  const rule = parseRBNF(raw);
  if (rule.isNothing()) {
    throw new Error(`Failed to parse RBNF rule: ${raw}`);
  }
  return rule.get()._1;
};

/**
 * Recurse through the syntax tree and extract and intern all symbols.
 */
export class RBNFSymbolExtractor {

  constructor(
    // Unique symbols sorted by frequency
    private symbols: FrequencySet<string>,

    // Unique numbers (base value / radix) sorted by frequency
    private numbers: FrequencySet<string>) {
  }

  /**
   * Populate the frequency-sorted symbol, base value / radix tables.
   */
  extract(root: JSONRoot): void {
    const rulesets = collect(root);
    for (const ruleset of rulesets) {
      const rules = ruleset[1].rules;

      for (const raw of rules) {
        const { value } = raw;

        // Extract base value and radix for normal rules
        if (/^\d+(\/\d+)?$/.test(value)) {
          for (const part of value.split('/')) {
            this.numbers.add(part);
          }
        }

        // Extract symbols inside instructions
        const nodes = parse(raw.rule);
        for (const node of nodes) {
          this.extractNode(node);
        }
      }
    }
  }

  /**
  * Recurse into the given node, interning all symbols found.
  */
  extractNode(node: RBNFNode): void {
    switch (node.kind) {
      case 'apply-unch-numfmt':
      case 'apply-left-numfmt':
      case 'apply-left-2-numfmt':
      case 'apply-right-numfmt':
      case 'literal':
        this.symbols.add(node.n);
        break;

      case 'cardinal':
      case 'ordinal':
        for (const child of node.n) {
          this.symbols.add(child.n);
        }
        break;
      case 'optional':
        for (const child of node.n) {
          this.extractNode(child);
        }
        break;
    }
  }

}

type Pair = [string, JSONRulesetInner];

/**
 * Parse RBNF rules and encode them compactly for distribution.
 */
export class RBNFEncoder {

  // Map ruleset names to their offset
  private index: Map<string, number> = new Map<string, number>();

  constructor(
    // Unique symbols sorted by frequency
    private symbols: FrequencySet<string>,

    // Unique numbers (base value / radix) sorted by frequency
    private numbers: FrequencySet<string>) {
  }

  encode(root: JSONRoot): any {
    let rulesets = collect(root).filter(r => !IGNORED.has(r[0]));

    // Sort all rulesets so the public sets are placed first, and then in alphabetical order.
    const cmp = (a: Pair, b: Pair) =>
      a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;

    const pub = rulesets.filter(r => r[1].private === 0).sort(cmp);
    const prv = rulesets.filter(r => r[1].private === 1).sort(cmp);

    rulesets = pub.concat(prv);

    // Map ruleset names to their offset
    rulesets.forEach((r, i) => {
      const name = r[0];
      this.index.set(name, i);
    });

    const result = this._encode(rulesets);

    // Public names, ordered 1:1 with their rulesets
    const names = rulesets.filter(r => r[1].private === 0).map(r => r[0]);
    const allnames = rulesets.map(r => r[0]);

    // Extract ruleset offset for all fraction rules
    const fractions: number[] = [];
    this.extractFractionRules(result).forEach(ref => fractions.push(ref));

    return {
      names: names.join('\t'),
      fractions: fractions.sort(),
      rulesets: result,

      // Optionally include debug info
      debug: DEBUG ? { allnames } : undefined,
    };
  }

  /**
   * PASS 2: Encode the final RBNF rules and instructions.
   */
  private _encode(rulesets: [string, JSONRulesetInner][]): any[][] {
    const symbols = this.symbols.sort();
    const numbers = this.numbers.sort();

    const result: any[][] = [];
    for (const ruleset of rulesets) {
      const rules: any[] = [];

      // Determine if we need to duplicate / split the fraction rule.
      // we want our runtime code to have to make as few guesses as possible,
      // so if the ruleset doesn't include separate fraction rules for commas
      // and periods, we split the rules.
      let period = false;
      let comma = false;
      for (const raw of ruleset[1].rules) {
        switch (raw.value) {
          case '0.x':
          case 'x.x':
            period = true;
            break;
          case '0,x':
          case 'x,x':
            comma = true;
            break;
        }
      }

      for (const raw of ruleset[1].rules) {

        // Decode the instruction array
        const inst = this.encodeRule(raw.rule, symbols);

        // Decode the rule descriptor.
        const { value } = raw;

        if (/^\d+$/.test(value)) {
          // Normal rule without an explicit radix.
          const i = numbers.indexOf(value);
          rules.push([RuleType.NORMAL, inst, i]);

        } else if (/^\d+(\/\d+)?$/.test(value)) {
          // Normal rule with explicit radix
          const p = value.split('/');
          const i = numbers.indexOf(p[0]);
          const j = numbers.indexOf(p[1]);

          rules.push([RuleType.NORMAL_RADIX, inst, i, j]);

        } else {
          // Atom rule
          switch (value) {
            case '-x':
              rules.push([RuleType.MINUS, inst]);
              break;

            case '0.x':
              rules.push([RuleType.PROPER_FRACTION, inst, 0]);
              if (!comma) {
                rules.push([RuleType.PROPER_FRACTION, inst, 1]);
              }
              break;

            case '0,x':
              rules.push([RuleType.PROPER_FRACTION, inst, 1]);
              if (!period) {
                rules.push([RuleType.PROPER_FRACTION, inst, 0]);
              }
              break;

            case 'x.x':
              rules.push([RuleType.IMPROPER_FRACTION, inst, 0]);
              if (!comma) {
                rules.push([RuleType.IMPROPER_FRACTION, inst, 1]);
              }
              break;

            case 'x,x':
              rules.push([RuleType.IMPROPER_FRACTION, inst, 1]);
              if (!period) {
                rules.push([RuleType.IMPROPER_FRACTION, inst, 0]);
              }
              break;

            case 'Inf':
              rules.push([RuleType.INFINITY, inst]);
              break;

            case 'NaN':
              rules.push([RuleType.NOT_A_NUMBER, inst]);
              break;
          }
        }
      }
      result.push(rules);
    }
    return result;
  }

  private extractFractionRules(rulesets: any[][]): Set<number> {
    const fractions: Set<number> = new Set();
    for (const ruleset of rulesets) {
      for (const rule of ruleset) {
        switch (rule[0]) {
          case RuleType.IMPROPER_FRACTION:
          case RuleType.PROPER_FRACTION:
            this.extractRuleRefs(fractions, rule[2]);
            break;
        }
      }
    }
    return fractions;
  }

  private extractRuleRefs(refs: Set<number>, insts: any[]): void {
    for (const inst of insts) {
      switch (inst[0]) {
        case Opcode.OPTIONAL:
          this.extractRuleRefs(refs, inst[1]);
          break;
        case Opcode.APPLY_RIGHT_RULE:
          refs.add(inst[1]);
          break;
      }
    }
  }

  /**
   * Parse and decode an RBNF rule.
   */
  private encodeRule(rule: string, symbols: string[]): any[] {
    const nodes = parse(rule);
    return nodes.map(n => this.encodeNode(n, symbols));
  }

  private encodeNode(node: RBNFNode, symbols: string[]): any {
    switch (node.kind) {
        case 'literal': {
          const i = symbols.indexOf(node.n);
          return [Opcode.LITERAL, i];
        }

        case 'apply-left-rule': {
          const i = this.ruleindex(node.n);
          return [Opcode.APPLY_LEFT_RULE, i];
        }

        case 'apply-left-numfmt': {
          const i = this.index.get(node.n);
          return [Opcode.APPLY_LEFT_NUM_FORMAT, i];
        }

        case 'apply-left-2-rule': {
          const i = this.ruleindex(node.n);
          return [Opcode.APPLY_LEFT_2_RULE, i];
        }

        case 'apply-left-2-numfmt': {
          const i = symbols.indexOf(node.n);
          return [Opcode.APPLY_LEFT_2_NUM_FORMAT, i];
        }

        case 'apply-right-rule': {
          const i = this.ruleindex(node.n);
          return [Opcode.APPLY_RIGHT_RULE, i];
        }

        case 'apply-right-numfmt': {
          const i = symbols.indexOf(node.n);
          return [Opcode.APPLY_RIGHT_NUM_FORMAT, i];
        }

        case 'apply-unch-rule': {
          const i = this.ruleindex(node.n);
          return [Opcode.UNCHANGED_RULE, i];
        }

        case 'apply-unch-numfmt': {
          const i = symbols.indexOf(node.n);
          return [Opcode.UNCHANGED_NUM_FORMAT, i];
        }

        case 'cardinal':
        case 'ordinal': {
          const block: any[] = [];
          for (const n of node.n) {
            const cat = PLURALS.indexOf(n.category);
            const i = symbols.indexOf(n.n);
            block.push([cat, i]);
          }
          return node.kind === 'cardinal' ? [Opcode.CARDINAL, block] : [Opcode.ORDINAL, block];
        }

        case 'optional': {
          const block = node.n.map(n => this.encodeNode(n, symbols));
          return [Opcode.OPTIONAL, block];
        }

        case 'sub-left':
          return [Opcode.SUB_LEFT];

        case 'sub-right':
          return [Opcode.SUB_RIGHT];

        case 'sub-right-3':
          return [Opcode.SUB_RIGHT_3];
      }
      throw new Error(`No encoder for node: ${JSON.stringify(node)}`);
  }

  private ruleindex(name: string): number {
    const key = name.replace(/^%+/, '');
    const i = this.index.get(key);
    if (i === undefined) {
      throw new Error(`Name references a rule outside this ruleset: ${name}`);
    }
    return i;
  }

}

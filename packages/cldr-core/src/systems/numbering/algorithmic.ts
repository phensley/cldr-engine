import { Decimal } from '@phensley/decimal';
import { algorithmicNumbering } from './autogen.names';
import { rbnfRulesets } from './autogen.rbnf';
import { RBNF, RBNFSet, RBNFSymbols } from './rbnf';

const U = undefined;
const ROOT = new RBNF(rbnfRulesets);
const RBNFROOT = ROOT.get('root')!;

export class AlgorithmicNumberingSystems {

  readonly rbnfset: RBNFSet | undefined;
  readonly rulenames: string[] = [];

  constructor(spellout: any, ...ids: string[]) {
    const rbnf = new RBNF(spellout);

    // Find the first defined system. This lets us check if a region-specific
    // system exists, falling back to the language-script.
    for (const id of ids) {
      this.rbnfset = rbnf.get(id);
      if (this.rbnfset) {
        this.rulenames = this.rbnfset.pubnames;
        // Include rules from the root locale that are not already defined
        // by the locale.
        for (const n of RBNFROOT.pubnames) {
          if (!this.rbnfset.index.has(n)) {
            this.rulenames.push(n);
          }
        }
      }
    }
    // If no locale rules are available, use those from the root locale.
    if (!this.rbnfset) {
      this.rulenames = RBNFROOT.pubnames.slice(0);
    }
  }

  /**
   * Return a globally-available rule-based numbering system, e.g. 'hant' or 'roman-upper'.
   */
  system(name: string, symbols: RBNFSymbols): AlgorithmicNumberingSystem | undefined {
    const path = algorithmicNumbering[name];
    if (path) {
      const set = ROOT.get(path[0]);
      if (set && set.index.has(path[1])) {
        return new AlgorithmicNumberingSystem(path[1], symbols, set);
      }
    }
    return U;
  }

  /**
   * Return a locale-specific rule-based numbering system, e.g. 'spellout-cardinal' or
   * 'digits-ordinal'.
   */
  rbnf(rule: string, symbols: RBNFSymbols): AlgorithmicNumberingSystem | undefined {
    let set: RBNFSet | undefined;
    if (this.rbnfset && this.rbnfset.index.has(rule)) {
      set = this.rbnfset;
    } else if (RBNFROOT.index.has(rule)) {
      set = RBNFROOT;
    }
    return set ? new AlgorithmicNumberingSystem(rule, symbols, set) : U;
  }

}

export class AlgorithmicNumberingSystem {

  constructor(
    readonly name: string,
    readonly symbols: RBNFSymbols,
    readonly rbnf: RBNFSet) {}

  format(n: Decimal): string {
    // Pass number params
    // TODO: pass down decimal == '.' to set flag
    return this.rbnf.format(this.name, this.symbols, n);
  }

}

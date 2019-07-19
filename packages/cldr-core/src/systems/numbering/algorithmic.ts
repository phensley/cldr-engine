import { Decimal } from '@phensley/decimal';
import { algorithmicNumbering } from './autogen.names';
import { rbnfRulesets } from './autogen.rbnf';
import { RBNF, RBNFSet } from './rbnf';

const U = undefined;
const ROOT = new RBNF(rbnfRulesets);

export class AlgorithmicNumberingSystems {

  readonly rbnf: RBNF;

  constructor(spellout: any) {
    this.rbnf = new RBNF(spellout);
  }

  system(name: string): AlgorithmicNumberingSystem | undefined {
    const path = algorithmicNumbering[name];
    return path ? this.spellout(...path) : U;
  }

  spellout(id: string, name: string): AlgorithmicNumberingSystem | undefined {
    for (const rbnf of [ROOT, this.rbnf]) {
      const set = rbnf.get(id);
      if (set && set.index.has(name)) {
        return new AlgorithmicNumberingSystem(name, set);
      }
    }

    // TODO: fallbacks?
    return U;
  }

}

export class AlgorithmicNumberingSystem {

  constructor(readonly name: string, readonly rbnf: RBNFSet) {}

  format(n: Decimal): string {
    // TODO: pass down decimal == '.' to set flag
    return this.rbnf.format(this.name, 0, n);
  }

}

import { rbnfRulesets } from './autogen.rbnf';
import { RBNF } from './rbnf';

export class AlgorithmicNumberingSystem {

  readonly rbnf: RBNF;

  constructor() {
    this.rbnf = new RBNF(rbnfRulesets);
  }

}

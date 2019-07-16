import { rbnfRulesets } from './autogen.rbnf';
import { RBNF } from './rbnf';

export class AlgorithmicNumberingSystem {

  readonly rbnfRulesets: any = rbnfRulesets;
  readonly rbnf: RBNF;

  constructor() {
    const root = rbnfRulesets.locales['ja-Jpan'];
    this.rbnf = new RBNF(root);
  }

}

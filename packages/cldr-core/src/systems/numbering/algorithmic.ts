import { rbnfRulesets } from './autogen.rbnf';
import { RBNF } from './rbnf';

export class AlgorithmicNumberingSystem {

  readonly rbnfRulesets: any = rbnfRulesets;
  readonly rbnf: RBNF;

  constructor() {
    const loc = rbnfRulesets.locales['ja-Jpan'];
    const decimal = 0;

    const numbers = rbnfRulesets.numbers.split('\t');
    const { fractions, rulesets } = loc;
    const names = loc.names.split('\t');
    const symbols = rbnfRulesets.symbols.split('\t');
    this.rbnf = new RBNF(names, decimal, numbers, symbols, fractions, rulesets);
  }

}

// const sys = new AlgorithmicNumberingSystem();
// console.log(sys.rbnf.names);

// import { algorithmicNumbering } from './autogen.names';
import { rbnfRulesets } from './autogen.rbnf';
import { RBNF } from './rbnf';

export class AlgorithmicNumberingSystems {

  readonly systems: Map<string, AlgorithmicNumberingSystem> = new Map();

}

export class AlgorithmicNumberingSystem {

  readonly rbnf: RBNF;

  constructor() {
    this.rbnf = new RBNF(rbnfRulesets);
  }

}

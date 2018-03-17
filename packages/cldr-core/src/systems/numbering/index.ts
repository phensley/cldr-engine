import { coerceDecimal, DecimalArg } from '../../types/numbers';
export { numericNumberingDigits } from './autogen.numeric';

export interface NumericNumberSystem {
  readonly type: 'numeric';
  readonly digits: string[];
}

export interface AlgorithmicNumberSystem {
  readonly type: 'algorithmic';
  format(n: DecimalArg): string;
}

export type NumberSystem = NumericNumberSystem | AlgorithmicNumberSystem;

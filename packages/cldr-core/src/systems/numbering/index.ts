import { DecimalArg } from '@phensley/decimal';
export * from './algorithmic';
export * from './decimal';

// TODO: replace with instances
export interface NumericNumberSystem {
  readonly type: 'numeric';
  readonly digits: string[];
}

export interface AlgorithmicNumberSystem {
  readonly type: 'algorithmic';
  format(n: DecimalArg): string;
}

export type NumberSystem = NumericNumberSystem | AlgorithmicNumberSystem;

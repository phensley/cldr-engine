import { DecimalArg } from '@phensley/decimal';
export * from './decimal';

// TODO: replace with instances
/**
 * @internal
 */
export interface NumericNumberSystem {
  readonly type: 'numeric';
  readonly digits: string[];
}

/**
 * @internal
 */
export interface AlgorithmicNumberSystem {
  readonly type: 'algorithmic';
  format(n: DecimalArg): string;
}

/**
 * @internal
 */
export type NumberSystem = NumericNumberSystem | AlgorithmicNumberSystem;

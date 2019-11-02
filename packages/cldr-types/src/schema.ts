import { PrimitiveBundle } from './bundle';

export interface KeyIndexMap {
  [name: string]: KeyIndex<string>;
}

export interface KeyIndex<T extends string> {
  readonly index: { [P in T]: number };
  readonly keys: T[];
  readonly size: number;
  get(key: T): number;
}

export interface FieldArrow {
  readonly offset: number;
  get(bundle: PrimitiveBundle): string;
}

export interface ScopeArrow<T extends string, R> {
  readonly map: { [P in T]: R };
  get(key: T): R | undefined;
}

export interface DigitsArrow<T extends string> {
  readonly offset: number;
  readonly index: KeyIndex<T>;
  readonly values: number[];
  readonly size2: number;
  get(bundle: PrimitiveBundle, key: T, digits: number): [string, number];
}

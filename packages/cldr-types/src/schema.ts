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

export interface Vector1Arrow<T extends string> {
  readonly len: number;
  readonly offset: number;
  readonly index: KeyIndex<T>;
  exists(bundle: PrimitiveBundle): boolean;
  get(bundle: PrimitiveBundle, key: T): string;
  mapping(bundle: PrimitiveBundle): { [P in T]: string };
}

export interface Vector2Arrow<T extends string, S extends string> {
  readonly size: number;
  readonly size2: number;
  readonly offset: number;
  readonly index1: KeyIndex<T>;
  readonly index2: KeyIndex<S>;
  exists(bundle: PrimitiveBundle): boolean;
  get(bundle: PrimitiveBundle, key1: T, key2: S): string;
  mapping(bundle: PrimitiveBundle): { [P in T]: { [Q in S]: string }};
}

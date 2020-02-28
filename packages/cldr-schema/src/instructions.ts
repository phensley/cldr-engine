import { KeyIndex } from '@phensley/cldr-types';

/**
 * Inverse mapping of a key to its index in an array.
 *
 * @public
 */
export class KeyIndexImpl<T extends string> implements KeyIndex<T> {
  /* tslint:disable-next-line */
  readonly index: { [P in T]: number } = Object.create(null);
  readonly size: number;
  constructor(readonly keys: T[]) {
    this.size = keys.length;
    let i = 0;
    while (i < keys.length) {
      this.index[keys[i]] = i;
      i++;
    }
  }
  get(key: T): number {
    const i = this.index[key];
    return i === undefined ? -1 : i;
  }
}

/**
 * @public
 */
export interface Digits {
  readonly type: 'digits';
  readonly name: string;
  readonly dim0: string;
  readonly values: number[];
}

/**
 * @public
 */
export interface Field {
  readonly type: 'field';
  readonly name: string;
}

/**
 * @public
 */
export interface Origin {
  readonly type: 'origin';
  readonly block: Scope[];
  readonly indices: { [x: string]: KeyIndex<any> };

  getIndex(name: string): KeyIndex<any>;
  getValues(name: string): string[];
}

const NULL_KEYINDEX = new KeyIndexImpl<string>([]);
const WARNED: { [x: string]: boolean } = {};

/**
 * @public
 */
export class OriginImpl implements Origin {
  readonly type: 'origin' = 'origin';

  constructor(
    readonly block: Scope[],
    readonly indices: { [x: string]: KeyIndex<string> }) { }

  getIndex(name: string): KeyIndex<string> {
    const r = this.indices[name];
    if (r === undefined) {
      /* istanbul ignore next */
      if (!WARNED[name]) {
        // NOTE: Unless something went horribly wrong, this should only occur during development.
        console.log(`Error: failed to locate index/value set named "${name}"`);
        WARNED[name] = true;
      }
      return NULL_KEYINDEX;
    }
    return r;
  }

  getValues(name: string): string[] {
    return this.getIndex(name).keys;
  }

}

/**
 * @public
 */
export interface Scope {
  readonly type: 'scope';
  readonly name: string;
  readonly identifier: string;
  readonly block: Instruction[];
}

/**
 * @public
 */
export interface ScopeMap {
  readonly type: 'scopemap';
  readonly name: string;
  readonly fields: string;
  readonly block: Instruction[];
}

/**
 * @public
 */
export interface Vector1 {
  readonly type: 'vector1';
  readonly name: string;
  readonly dim0: string;
}

/**
 * @public
 */
export interface Vector2 {
  readonly type: 'vector2';
  readonly name: string;
  readonly dim0: string;
  readonly dim1: string;
}

/**
 * @public
 */
export type Instruction =
  Digits |
  Field |
  Origin |
  Scope |
  ScopeMap |
  Vector1 |
  Vector2;

/**
 * @internal
 */
export const digits = (name: string, dim0: string, values: number[]): Digits =>
  ({ type: 'digits', name, dim0, values });

/**
 * @internal
 */
export const field = (name: string): Field =>
  ({ type: 'field', name });

/**
 * @internal
 */
export const origin = (
  block: Scope[],
  indices: { [x: string]: KeyIndex<any> }): Origin =>
  new OriginImpl(block, indices);

/**
 * @internal
 */
export const scope = (name: string, identifier: string, block: Instruction[]): Scope =>
  ({ type: 'scope', name, identifier, block });

/**
 * @internal
 */
export const scopemap = (name: string, fields: string, block: Instruction[]): ScopeMap =>
  ({ type: 'scopemap', name, fields, block });

/**
 * @internal
 */
export const vector1 = (name: string, dim0: string): Vector1 =>
  ({ type: 'vector1', name, dim0 });

/**
 * @internal
 */
export const vector2 = (name: string, dim0: string, dim1: string): Vector2 =>
  ({ type: 'vector2', name, dim0, dim1 });

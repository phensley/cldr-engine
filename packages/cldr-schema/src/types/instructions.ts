/**
 * Inverse mapping of a key to its index in an array.
 */
export class KeyIndex<T extends string> {
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

export interface Digits {
  readonly type: 'digits';
  readonly name: string;
  readonly dim0: string;
  readonly values: number[];
}

export interface Field {
  readonly type: 'field';
  readonly name: string;
}

export interface Origin {
  readonly type: 'origin';
  readonly block: Scope[];
  readonly indices: { [x: string]: KeyIndex<any> };
  readonly values: { [x: string]: string[] };

  getIndex(name: string): KeyIndex<any>;
  getValues(name: string): string[];
}

export class OriginImpl implements Origin {
  readonly type: 'origin' = 'origin';

  constructor(
    readonly block: Scope[],
    readonly indices: { [x: string]: KeyIndex<any> },
    readonly values: { [x: string]: string[] }) {
  }

  getIndex(name: string): KeyIndex<any> {
    return this.get(name, this.indices);
  }

  getValues(name: string): string[] {
    return this.get(name, this.values);
  }

  private get<T>(name: string, map: { [x: string]: T }): T {
    const r = map[name];
    if (r === undefined) {
      // NOTE: This should only occur during development.
      throw new Error(`Severe error: failed to locate index/value set named "${name}"`);
    }
    return r;
  }

}

export interface Scope {
  readonly type: 'scope';
  readonly name: string;
  readonly identifier: string;
  readonly block: Instruction[];
}

export interface ScopeMap {
  readonly type: 'scopemap';
  readonly name: string;
  readonly fields: string;
  readonly block: Instruction[];
}

export interface Vector1 {
  readonly type: 'vector1';
  readonly name: string;
  readonly dim0: string;
}

export interface Vector2 {
  readonly type: 'vector2';
  readonly name: string;
  readonly dim0: string;
  readonly dim1: string;
}

export type Instruction =
  Digits |
  Field |
  Origin |
  Scope |
  ScopeMap |
  Vector1 |
  Vector2;

export const digits = (name: string, dim0: string, values: number[]): Digits =>
  ({ type: 'digits', name, dim0, values });

export const field = (name: string): Field =>
  ({ type: 'field', name });

export const origin = (
    block: Scope[],
    indices: { [x: string]: KeyIndex<any> },
    values: { [x: string]: string[] }): Origin =>
  new OriginImpl(block, indices, values);

export const scope = (name: string, identifier: string, block: Instruction[]): Scope =>
  ({ type: 'scope', name, identifier, block });

export const scopemap = (name: string, fields: string, block: Instruction[]): ScopeMap =>
  ({ type: 'scopemap', name, fields, block });

export const vector1 = (name: string, dim0: string): Vector1 =>
  ({ type: 'vector1', name, dim0 });

export const vector2 = (name: string, dim0: string, dim1: string): Vector2 =>
  ({ type: 'vector2', name, dim0, dim1 });

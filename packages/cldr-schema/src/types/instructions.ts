/**
 * Inverse mapping of a key to its index in an array.
 */
export class KeyIndex<T> {
  readonly index: { [x: string]: number } = {};
  readonly size: number;
  constructor(readonly keys: string[]) {
    this.size = keys.length;
    let i = 0;
    while (i < keys.length) {
      this.index[keys[i]] = i;
      i++;
    }
  }
  get(key: string): number {
    const i = this.index[key];
    return i === undefined ? -1 : i;
  }
}

export enum Choice {
  NONE = 0,
  PLURAL = 1,
  ALT = 2,
  YEARTYPE = 3
}

export interface Digits {
  readonly type: 'digits';
  readonly name: string;
}

export interface Field {
  readonly type: 'field';
  readonly name: string;
  readonly identifier: string;
  readonly choice: Choice;
}

export interface ObjectMap {
  readonly type: 'objectmap';
  readonly name: string;
  readonly fields: string[];
}

export interface Origin {
  readonly type: 'origin';
  readonly block: Instruction[];
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
  readonly fields: string[];
  readonly block: Instruction[];
}

export interface Vector1<T extends string> {
  readonly type: 'vector1';
  readonly name: string;
  readonly dim0: KeyIndex<T>;
}

export interface Vector2<T extends string, S extends string> {
  readonly type: 'vector2';
  readonly name: string;
  readonly dim0: KeyIndex<T>;
  readonly dim1: KeyIndex<S>;
}

// export interface Vector3 {
//   readonly type: 'vector3';
//   readonly name: string;
//   readonly dim0: KeyIndex;
//   readonly dim1: KeyIndex;
//   readonly dim2: KeyIndex;
// }

export type Instruction =
  Digits |
  Field |
  // FieldMap |
  ObjectMap |
  Origin |
  Scope |
  ScopeMap |
  Vector1<string> |
  Vector2<string, string>;

export const digits = (name: string) =>
  ({ type: 'digits', name } as Digits);

export const field = (name: string, identifier: string, choice: Choice = Choice.NONE) =>
  ({ type: 'field', name, identifier, choice } as Field);

export const objectmap = (name: string, fields: string[]) =>
  ({ type: 'objectmap', name, fields } as ObjectMap);

export const origin = (block: Instruction[]) =>
  ({ type: 'origin', block } as Origin);

export const scope = (name: string, identifier: string, block: Instruction[]) =>
  ({ type: 'scope', name, identifier, block } as Scope);

export const scopemap = (name: string, fields: string[], block: Instruction[]) =>
  ({ type: 'scopemap', name, fields, block } as ScopeMap);

export const vector1 = <T extends string>(name: string, dim0: KeyIndex<T>): Vector1<T> =>
  ({ type: 'vector1', name, dim0 });

export const vector2 = <T extends string, S extends string>(name: string, dim0: KeyIndex<T>, dim1: KeyIndex<S>):
  Vector2<T, S> => ({ type: 'vector2', name, dim0, dim1 });

// export const vector3 = (name: string, dim0: KeyIndex, dim1: KeyIndex, dim2: KeyIndex): Vector3 =>
//   ({ type: 'vector3', name, dim0, dim1, dim2 });

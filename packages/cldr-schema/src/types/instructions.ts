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

export interface Digits<T extends string> {
  readonly type: 'digits';
  readonly name: string;
  readonly dim0: KeyIndex<T>;
  readonly values: number[];
}

export interface Field {
  readonly type: 'field';
  readonly name: string;
}

export interface Origin {
  readonly type: 'origin';
  readonly block: Scope[];
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
  Digits<any> |
  Field |
  Origin |
  Scope |
  ScopeMap |
  Vector1<any> |
  Vector2<any, any>;

export const digits = <T extends string>(name: string, dim0: KeyIndex<T>, values: number[]): Digits<T> =>
  ({ type: 'digits', name, dim0, values });

export const field = (name: string): Field =>
  ({ type: 'field', name });

export const origin = (block: Scope[]): Origin =>
  ({ type: 'origin', block });

export const scope = (name: string, identifier: string, block: Instruction[]): Scope =>
  ({ type: 'scope', name, identifier, block });

export const scopemap = (name: string, fields: string[], block: Instruction[]): ScopeMap =>
  ({ type: 'scopemap', name, fields, block });

export const vector1 = <T extends string>(name: string, dim0: KeyIndex<T>): Vector1<T> =>
  ({ type: 'vector1', name, dim0 });

export const vector2 = <T extends string, S extends string>(name: string, dim0: KeyIndex<T>, dim1: KeyIndex<S>):
  Vector2<T, S> => ({ type: 'vector2', name, dim0, dim1 });

// export const vector3 = (name: string, dim0: KeyIndex, dim1: KeyIndex, dim2: KeyIndex): Vector3 =>
//   ({ type: 'vector3', name, dim0, dim1, dim2 });

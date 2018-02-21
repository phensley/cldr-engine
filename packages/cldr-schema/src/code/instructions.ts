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

export interface FieldMap {
  readonly type: 'fieldmap';
  readonly name: string;
  readonly fields: string[];
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

export interface ScopeField {
  readonly type: 'scopefield';
  readonly name: string;
  readonly fields: string[];
}

export interface ScopeMap {
  readonly type: 'scopemap';
  readonly name: string;
  readonly fields: string[];
  readonly block: Instruction[];
}

export type Instruction = Digits | Field | FieldMap | ObjectMap | Origin | Scope | ScopeField | ScopeMap;

export const digits = (name: string) =>
  ({ type: 'digits', name } as Digits);

export const field = (name: string, identifier: string, choice: Choice = Choice.NONE) =>
  ({ type: 'field', name, identifier, choice } as Field);

export const fieldmap = (name: string, fields: string[], choice: Choice = Choice.NONE) =>
  ({ type: 'fieldmap', name, fields, choice } as FieldMap);

export const objectmap = (name: string, fields: string[]) =>
  ({ type: 'objectmap', name, fields } as ObjectMap);

export const origin = (block: Instruction[]) =>
  ({ type: 'origin', block } as Origin);

export const scope = (name: string, identifier: string, block: Instruction[]) =>
  ({ type: 'scope', name, identifier, block } as Scope);

export const scopefield = (name: string, fields: string[]) =>
  ({ type: 'scopefield', name, fields } as ScopeField);

export const scopemap = (name: string, fields: string[], block: Instruction[]) =>
  ({ type: 'scopemap', name, fields, block } as ScopeMap);

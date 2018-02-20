import { Choice } from '../code';
import { Plural } from './enums';

export type OffsetMap = { [x: string]: number };
export type OffsetsMap = { [x: string]: number[] };

/**
 * Encapsulates a set of strings, providing access to a string
 * at a given offset.
 */
export interface Bundle {
  bundleId(): string;
  get(offset: number): string;
}

export interface DigitsArrow {
  (bundle: Bundle, digits: number, index: number): string;
}

export interface FieldArrow {
  (bundle: Bundle): string;
}

export interface FieldIndexedArrow<X extends number> {
  (bundle: Bundle, index: X): string;
}

export interface FieldMapArrow<T extends string> {
  (bundle: Bundle, field: T): string;
}

export interface FieldMapIndexedArrow<T extends string, X extends number> {
  (bundle: Bundle, field: T, index: X): string;
}

export interface ScopeArrow<T extends string, R> {
  (name: T): R;
}

export const digitsArrow = (table: number[][]): DigitsArrow => {
  return (bundle: Bundle, digits: number, index: number): string => {
    if (digits < 4) {
      return '';
    }
    digits -= 4;
    const offsets = digits >= table.length ? table[table.length - 1] : table[digits];
    return offsets === undefined ? '' : bundle.get(offsets[index]);
  };
};

export const fieldArrow = (offset: number): FieldArrow => {
  return (bundle): string => bundle.get(offset);
};

export const fieldIndexedArrow = (offsets: number[]): FieldIndexedArrow<number> => {
  return (bundle: Bundle, index: number): string => {
    return bundle.get(offsets[index]);
  };
};

export const fieldMapArrow = (map: OffsetMap): FieldMapArrow<string> => {
  return (bundle: Bundle, field: string): string => {
    const offset = map[field];
    return offset === undefined ? '' : bundle.get(offset);
  };
};

export const fieldMapIndexedArrow = (map: OffsetsMap): FieldMapIndexedArrow<string, number> => {
  return (bundle: Bundle, field: string, index: number): string => {
    const offsets = map[field];
    return offsets === undefined ? '' : bundle.get(offsets[index]);
  };
};

export const scopeArrow = (map: any, undef: any): ScopeArrow<string, any> => {
  return (field: string): any => map[field] || undef;
};

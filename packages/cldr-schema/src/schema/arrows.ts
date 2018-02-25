export type OffsetMap = { [x: string]: number };
export type OffsetsMap = { [x: string]: number[] };
export type KeyIndexMap = [string, number][];

/**
 * Encapsulates a set of strings, providing access to a string
 * at a given offset.
 */
export interface Bundle {
  bundleId(): string;
  language(): string;
  region(): string;
  get(offset: number): string;
}

export interface DigitsArrow {
  (bundle: Bundle, digits: number, index: number): string;
}

export interface DivisorArrow {
  (bundle: Bundle, digits: number): number;
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

export interface ObjectArrow<T> {
  (bundle: Bundle): T;
}

export interface ScopeArrow<T extends string, R> {
  (name: T): R;
}

export const digitsArrow = (table: number[][]): DigitsArrow => {
  return (bundle: Bundle, digits: number, index: number): string => {
    if (digits < 1) {
      return '';
    }
    digits -= 1;
    const offsets = digits >= table.length ? table[table.length - 1] : table[digits];
    return offsets === undefined ? '' : bundle.get(offsets[index]);
  };
};

export const divisorArrow = (table: number[]): DivisorArrow => {
  return (bundle: Bundle, digits: number): number => {
    if (digits < 1) {
      return 0;
    }
    digits -= 1;
    const offset = digits >= table.length ? table[table.length - 1] : table[digits];
    return Number(bundle.get(offset));
  };
};

export const fieldArrow = (offset: number): FieldArrow => {
  return (bundle): string => bundle.get(offset);
};

export const fieldIndexedArrow = (offsets: number[]): FieldIndexedArrow<number> => {
  return (bundle: Bundle, index: number): string => bundle.get(offsets[index]);
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

export const objectMapArrow = (index: KeyIndexMap): ObjectArrow<any> => {
  return (bundle: Bundle): any => {
    const o: any = {};
    for (let i = 0; i < index.length; i++) {
      const [key, offset] = index[i];
      o[key] = bundle.get(offset);
    }
    return o;
  };
};

export const scopeArrow = (map: any, undef: any): ScopeArrow<string, any> => {
  return (field: string): any => map[field] || undef;
};

export type OffsetMap = { [x: string]: number };
export type OffsetsMap = { [x: string]: number[] };
export type KeyIndexMap = [string, number][];

/**
 * Very low-level access to strings in a bundle. Includes properties
 * needed to resolve locales within a pack.
 */
export interface PrimitiveBundle {
  id(): string;
  language(): string;
  region(): string;
  get(offset: number): string;
}

export interface DigitsArrow {
  (bundle: PrimitiveBundle, digits: number, index: number): string;
}

export interface DivisorArrow {
  (bundle: PrimitiveBundle, digits: number): number;
}

export interface FieldArrow {
  (bundle: PrimitiveBundle): string;
}

export interface FieldIndexedArrow<X extends number> {
  (bundle: PrimitiveBundle, index: X): string;
}

export interface FieldMapArrow<T extends string> {
  (bundle: PrimitiveBundle, field: T): string;
}

export interface FieldMapIndexedArrow<T extends string, X extends number> {
  (bundle: PrimitiveBundle, field: T, index: X): string;
}

export interface ObjectArrow<T> {
  (bundle: PrimitiveBundle): T;
}

export interface ScopeArrow<T extends string, R> {
  (name: T): R;
}

export const digitsArrow = (table: number[][]): DigitsArrow => {
  return (bundle: PrimitiveBundle, digits: number, index: number): string => {
    if (digits < 1) {
      return '';
    }
    digits -= 1;
    const offsets = digits >= table.length ? table[table.length - 1] : table[digits];
    return offsets === undefined ? '' : bundle.get(offsets[index]);
  };
};

export const divisorArrow = (table: number[]): DivisorArrow => {
  return (bundle: PrimitiveBundle, digits: number): number => {
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
  return (bundle: PrimitiveBundle, index: number): string => bundle.get(offsets[index]);
};

export const fieldMapArrow = (map: OffsetMap): FieldMapArrow<string> => {
  return (bundle: PrimitiveBundle, field: string): string => {
    const offset = map[field];
    return offset === undefined ? '' : bundle.get(offset);
  };
};

export const fieldMapIndexedArrow = (map: OffsetsMap): FieldMapIndexedArrow<string, number> => {
  return (bundle: PrimitiveBundle, field: string, index: number): string => {
    const offsets = map[field];
    return offsets === undefined ? '' : bundle.get(offsets[index]);
  };
};

export const objectMapArrow = (index: KeyIndexMap): ObjectArrow<any> => {
  return (bundle: PrimitiveBundle): any => {
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

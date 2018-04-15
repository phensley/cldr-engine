import { KeyIndex } from '../types';

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

export class Vector1Arrow<T extends string> {

  readonly len: number;

  constructor(readonly offset: number, readonly index: KeyIndex<T>) {
    this.len = index.keys.length;
  }

  get(bundle: PrimitiveBundle, key: T): string {
    const i = this.index.get(key);
    return i === -1 ? '' : bundle.get(this.offset + i);
  }

  mapping(bundle: PrimitiveBundle): any {
    const len = this.len;
    const offset = this.offset;
    const keys = this.index.keys;
    const res: any = {};
    for (let i = 0; i < len; i++) {
      const s = bundle.get(offset + i);
      if (s) {
        const k = keys[i];
        res[k] = s;
      }
    }
    return res;
  }

  values(bundle: PrimitiveBundle): string[] {
    const len = this.len;
    const offset = this.offset;
    const res: string[] = [];
    for (let i = 0; i < len; i++) {
      const s = bundle.get(offset + i);
      if (s) {
        res.push(s);
      }
    }
    return res;
  }
}

export class Vector2Arrow<T extends string, S extends string> {

  readonly size: number;
  readonly size2: number;

  constructor(readonly offset: number, readonly index1: KeyIndex<T>, readonly index2: KeyIndex<S>) {
    this.size = index1.size * index2.size;
    this.size2 = index2.size;
  }

  get(bundle: PrimitiveBundle, key1: T, key2: S): string {
    const i = this.index1.get(key1);
    if (i !== -1) {
      const j = this.index2.get(key2);
      if (j !== -1) {
        const k = this.offset + (i * this.size2) + j;
        return bundle.get(k);
      }
    }
    return '';
  }

  mapping(bundle: PrimitiveBundle, keyopt?: T): any {
    const size2 = this.size2;
    const keys1 = this.index1.keys;
    const keys2 = this.index2.keys;
    const offset = this.offset;
    const res: any = {};

    if (keyopt) {
      const i = this.index1.get(keyopt);
      if (i !== -1) {
        for (let j = 0; j < keys2.length; j++) {
          const k = offset + (i * size2) + j;
          const s = bundle.get(k);
          if (s) {
            const key2 = keys2[j];
            res[key2] = s;
          }
        }
      }

    } else {
      for (let i = 0; i < keys1.length; i++) {
        let exists = false;
        const o: any = {};
        for (let j = 0; j < keys2.length; j++) {
          const k = offset + (i * size2) + j;
          const s = bundle.get(k);
          if (s) {
            exists = true;
            const key2 = keys2[j];
            o[key2] = s;
          }
        }
        if (exists) {
          const key1 = keys1[i];
          res[key1] = o;
        }
      }
    }
    return res;
  }
}

export const vector1Arrow = (offset: number, index: KeyIndex<string>): Vector1Arrow<string> =>
  new Vector1Arrow(offset, index);

export const vector2Arrow = (offset: number, index1: KeyIndex<string>, index2: KeyIndex<string>) =>
  new Vector2Arrow(offset, index1, index2);

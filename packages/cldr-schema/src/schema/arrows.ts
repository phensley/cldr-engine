import { KeyIndex } from '../types';

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

export class FieldArrow {
  constructor(readonly offset: number) {}

  get(bundle: PrimitiveBundle): string {
    return bundle.get(this.offset);
  }
}

export class ScopeArrow<T extends string, R> {

  constructor(
    readonly map: { [P in T]: R }) { }

  get(key: T): R | undefined {
    return this.map[key];
  }
}

/**
 * Special vector to store a pluralized number pattern and its divisor together.
 */
export class DigitsArrow<T extends string> {

  static EMPTY: [string, number] = ['', 0];

  readonly size2: number;

  constructor(readonly offset: number, readonly index: KeyIndex<T>, readonly values: number[]) {
    this.size2 = values.length * 2; // store pattern and divisor as a pair
  }

  get(bundle: PrimitiveBundle, key: T, digits: number): [string, number] {
    if (digits > this.values.length) {
      digits = this.values.length;
    }
    if (digits > 0) {
      const i = this.index.get(key);
      if (i !== -1) {
        const k = this.offset + (i * this.size2) + ((digits - 1) * 2);
        const p = bundle.get(k);
        const d = bundle.get(k + 1);
        return [p, Number(d)];
      }
    }
    return DigitsArrow.EMPTY;
  }
}

export class Vector1Arrow<T extends string> {

  readonly len: number;
  readonly offset: number;
  constructor(offset: number, readonly index: KeyIndex<T>) {
    this.len = index.keys.length;
    this.offset = offset + 1; // skip header
  }

  exists(bundle: PrimitiveBundle): boolean {
    return bundle.get(this.offset - 1) === 'E';
  }

  get(bundle: PrimitiveBundle, key: T): string {
    const exists = bundle.get(this.offset - 1) === 'E';
    if (exists) {
      const i = this.index.get(key);
      return i === -1 ? '' : bundle.get(this.offset + i);
    }
    return '';
  }

  mapping(bundle: PrimitiveBundle): { [P in T]: string } {
    const len = this.len;
    const offset = this.offset;
    const keys = this.index.keys;
    /* tslint:disable-next-line */
    const res: { [P in T]: string } = Object.create(null);
    const exists = bundle.get(offset - 1) === 'E';
    if (!exists) {
      return res;
    }
    for (let i = 0; i < len; i++) {
      const s = bundle.get(offset + i);
      if (s) {
        const k = keys[i];
        res[k] = s;
      }
    }
    return res;
  }
}

export class Vector2Arrow<T extends string, S extends string> {

  readonly size: number;
  readonly size2: number;
  readonly offset: number;

  constructor(offset: number, readonly index1: KeyIndex<T>, readonly index2: KeyIndex<S>) {
    this.size = index1.size * index2.size;
    this.size2 = index2.size;
    this.offset = offset + 1; // skip header
  }

  exists(bundle: PrimitiveBundle): boolean {
    return bundle.get(this.offset - 1) === 'E';
  }

  get(bundle: PrimitiveBundle, key1: T, key2: S): string {
    const exists = bundle.get(this.offset - 1) === 'E';
    if (exists) {
      const i = this.index1.get(key1);
      if (i !== -1) {
        const j = this.index2.get(key2);
        if (j !== -1) {
          const k = this.offset + (i * this.size2) + j;
          return bundle.get(k);
        }
      }
    }
    return '';
  }

  mapping(bundle: PrimitiveBundle): { [P in T]: { [Q in S]: string }} {
    const offset = this.offset;
    /* tslint:disable-next-line */
    const res: { [P in T]: { [Q in S]: string } } = Object.create(null);
    let exists = bundle.get(offset - 1) === 'E';
    if (!exists) {
      return res;
    }

    const size2 = this.size2;
    const keys1 = this.index1.keys;
    const keys2 = this.index2.keys;
    for (let i = 0; i < keys1.length; i++) {
      exists = false;
      /* tslint:disable-next-line */
      const o: { [Q in S]: string } = Object.create(null);
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
    return res;
  }
}

import { DigitsArrow, FieldArrow, KeyIndex, PrimitiveBundle, ScopeArrow } from '@phensley/cldr-types';

/**
 * @public
 */
export class FieldArrowImpl implements FieldArrow {
  constructor(readonly offset: number) {}

  get(bundle: PrimitiveBundle): string {
    return bundle.get(this.offset);
  }
}

/**
 * @public
 */
export class ScopeArrowImpl<T extends string, R> implements ScopeArrow<T, R> {
  constructor(readonly map: { [P in T]: R }) {}

  get(key: T): R | undefined {
    return this.map[key];
  }
}

/**
 * Special vector to store a pluralized number pattern and its divisor together.
 *
 * @public
 */
export class DigitsArrowImpl<T extends string> implements DigitsArrow<T> {
  static EMPTY: [string, number] = ['', 0];

  readonly size2: number;

  constructor(
    readonly offset: number,
    readonly index: KeyIndex<T>,
    readonly values: number[],
  ) {
    this.size2 = values.length * 2; // store pattern and divisor as a pair
  }

  get(bundle: PrimitiveBundle, key: T, digits: number): [string, number] {
    if (digits > this.values.length) {
      digits = this.values.length;
    }
    if (digits > 0) {
      const i = this.index.get(key);
      if (i !== -1) {
        const k = this.offset + i * this.size2 + (digits - 1) * 2;
        const p = bundle.get(k);
        const d = bundle.get(k + 1);
        return [p, Number(d)];
      }
    }
    return DigitsArrowImpl.EMPTY;
  }
}

/**
 * Generalized multi-dimensional vector arrow.
 *
 * @public
 */
export class VectorArrowImpl {
  readonly offset: number;
  readonly len: number;

  private last: number;
  private factors: number[];

  constructor(
    offset: number,
    readonly keysets: KeyIndex<string>[],
  ) {
    this.offset = offset + 1; // skip over header
    this.len = keysets.length;
    this.last = this.len - 1;
    this.factors = new Array(this.len);

    // Pre-compute the address factor for each dimension:
    //  1-dim:        [ index0 ]
    //  2-dim:        [ (index0 * size1), index1 ]
    //  3-dim:        [ (index0 * size1 * size2), (index1 * size), index2 ]
    //  ...
    for (let i = 0; i < this.len; i++) {
      let k = 1;
      for (let j = i + 1; j < this.len; j++) {
        k *= this.keysets[j].size;
      }
      this.factors[i] = k;
    }
  }

  valid(...keys: (string | string[])[]): boolean {
    return this._index(keys, 0, this.offset) !== -1;
  }

  exists(bundle: PrimitiveBundle): boolean {
    return bundle.get(this.offset - 1) === 'E';
  }

  get(bundle: PrimitiveBundle, ...keys: (string | string[])[]): string {
    if (keys.length !== this.len) {
      // Impossible lookup, will never reach a valid field
      throw new Error(`Warning: impossible vector lookup with keys ${JSON.stringify(keys)}`);
    }
    if (!this.exists(bundle)) {
      return '';
    }
    return this._get(bundle, keys, 0, this.offset);
  }

  mapping(bundle: PrimitiveBundle): any {
    return this.exists(bundle) ? this._mapping(bundle, 0, 0) : {};
  }

  private _index(keys: (string | string[])[], ix: number, k: number): number {
    const key = keys[ix];
    const args = typeof key === 'string' ? [key] : key;
    const last = args.length - 1;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const j = this.keysets[ix].get(arg);
      if (j === -1) {
        if (i !== last) {
          continue;
        }
        return -1;
      }
      const kk = k + j * this.factors[ix];
      if (ix === this.last) {
        return kk;
      }
      const result = this._index(keys, ix + 1, kk);
      if (result !== -1) {
        return result;
      }
    }
    return -1;
  }

  private _get(bundle: PrimitiveBundle, keys: (string | string[])[], ix: number, k: number): string {
    const key = keys[ix];
    const args = typeof key === 'string' ? [key] : key;
    const last = args.length - 1;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const j = this.keysets[ix].get(arg);
      if (j === -1) {
        if (i !== last) {
          continue;
        }
        return '';
      }
      const kk = k + j * this.factors[ix];
      const val = ix === this.last ? bundle.get(kk) : this._get(bundle, keys, ix + 1, kk);
      if (!!val) {
        return val;
      }
    }
    return '';
  }

  private _mapping(bundle: PrimitiveBundle, k: number, ix: number): any {
    const o: any = {};
    const keys = this.keysets[k].keys;
    const last = k === this.last;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (last) {
        // We're at the value level of the map, so lookup the corresponding string
        const val = bundle.get(this.offset + i + ix);
        if (val) {
          o[key] = val;
        }
      } else {
        // Drill one level deeper
        o[key] = this._mapping(bundle, k + 1, ix + i * this.factors[k]);
      }
    }
    return o;
  }
}

import {
  DigitsArrow,
  FieldArrow,
  KeyIndex,
  PrimitiveBundle,
  ScopeArrow,
  Vector1Arrow,
  Vector2Arrow,
} from '@phensley/cldr-types';

/**
 * @public
 */
export class FieldArrowImpl implements FieldArrow {
  constructor(readonly offset: number) { }

  get(bundle: PrimitiveBundle): string {
    return bundle.get(this.offset);
  }
}

/**
 * @public
 */
export class ScopeArrowImpl<T extends string, R> implements ScopeArrow<T, R> {

  constructor(
    readonly map: { [P in T]: R }) { }

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
    return DigitsArrowImpl.EMPTY;
  }
}

/**
 * Generalized multi-dimensional vector arrow.
 *
 * @public
 */
export class VectorArrowImpl implements Vector1Arrow<string>, Vector2Arrow<string, string> {

  readonly offset: number;
  readonly len: number;

  private last: number;
  private factors: number[];
  private warning: boolean = false;

  constructor(offset: number, readonly keysets: KeyIndex<string>[]) {
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

  exists(bundle: PrimitiveBundle): boolean {
    return bundle.get(this.offset - 1) === 'E';
  }

  get(bundle: PrimitiveBundle, ...keys: string[]): string {
    if (!this.exists(bundle)) {
      return '';
    }
    if (keys.length !== this.len) {
      // Impossible lookup, will never reach a valid field
      if (!this.warning) {
        console.log(`Warning: impossible vector lookup with keys ${JSON.stringify(keys)}`);
        this.warning = true;
      }
      return '';
    }
    let k = this.offset;
    for (let i = 0; i < this.len; i++) {
      const j = this.keysets[i].get(keys[i]);
      if (j === -1) {
        // Invalid lookup
        return '';
      }
      k += j * this.factors[i];
    }
    return bundle.get(k);
  }

  mapping(bundle: PrimitiveBundle): any {
    return this.exists(bundle) ? this._mapping(bundle, 0, 0) : {};
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
        o[key] = this._mapping(bundle, k + 1, ix + (i * this.factors[k]));
      }
    }
    return o;
  }

}

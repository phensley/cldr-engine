
/**
 * Runtime impl for minimal perfect hash tables built by cldr-compiler
 */

import { Constants, FNV } from './fnv';

/**
 * Minimal perfect hash table.
 *
 * @public
 */
export interface MPHashTable<T> {
  // Intermediate table
  g: number[];

  // Values array
  v: T[];

  // Number of keys
  s: number;
}

/**
 * Hash a key for use in minimal perfect hashing.
 *
 * @public
 */
export const mphash = (d: number, len: number, s: string) =>
  FNV(d || Constants.FNV1A_BASIS, s) % len;

/**
 * Lookup a key in the given minimal perfect hash table.
 *
 * @public
 */
export const mplookup = <T>(t: MPHashTable<T>, key: string) => {
  let d = t.g[mphash(0, t.s, key)];
  if (d < 0) {
    return t.v[-d - 1];
  }
  d = mphash(d, t.s, key);
  return t.v[d];
};

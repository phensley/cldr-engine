import { PrimitiveBundle } from './bundle';

/**
 * Maps a name to a key index.
 *
 * @public
 */
export interface KeyIndexMap {
  [name: string]: KeyIndex<string>;
}

/**
 * Indexes each string in an array to its offset in the array.
 *
 * @public
 */
export interface KeyIndex<T extends string> {
  readonly index: { [P in T]: number };
  readonly keys: T[];
  readonly size: number;
  readonly last: number;
  get(key: T): number;
}

/**
 * Function for fetching a single field.
 *
 * @public
 */
export interface FieldArrow {
  readonly offset: number;
  get(bundle: PrimitiveBundle): string;
}

/**
 * Function for entering a new scope.
 *
 * @public
 */
export interface ScopeArrow<T extends string, R> {
  readonly map: { [P in T]: R };
  get(key: T): R | undefined;
}

/**
 * Function for fetching a field based on plural category and
 * number of digits.
 *
 * @public
 */
export interface DigitsArrow<T extends string> {
  readonly offset: number;
  readonly index: KeyIndex<T>;
  readonly values: number[];
  readonly size2: number;

  /**
   * Gets the field for the given plural category and number of integer digits.
   */
  get(bundle: PrimitiveBundle, key: T, digits: number): [string, number];
}

/**
 * Function representing a 1-dimensional vector.
 *
 * @public
 */
export interface Vector1Arrow<T extends string> {
  /**
   * Indicates this vector exists in the bundle.
   */
  exists(bundle: PrimitiveBundle): boolean;

  /**
   * Gets the field at the corresponding offset of the given key.
   */
  get(bundle: PrimitiveBundle, key: T | T[]): string;

  /**
   * Full mapping of all keys to the corresponding fields.
   */
  mapping(bundle: PrimitiveBundle): { [P in T]: string };
}

/**
 * Function representing a 2-dimensional vector.
 *
 * @public
 */
export interface Vector2Arrow<T extends string, S extends string> {
  /**
   * Indicates this vector exists in the bundle.
   */
  exists(bundle: PrimitiveBundle): boolean;

  /**
   * Gets the field at the corresponding offset [key1, key2]
   */
  get(bundle: PrimitiveBundle, key1: T | T[], key2: S | S[]): string;

  /**
   * Full mapping of all keys to the corresponding fields.
   */
  mapping(bundle: PrimitiveBundle): { [P in T]: { [Q in S]: string } };
}

/**
 * Function representing a 3-dimensional vector.
 *
 * @public
 */
export interface Vector3Arrow<T extends string, S extends string, U extends string> {
  /**
   * Indicates this vector exists in the bundle.
   */
  exists(bundle: PrimitiveBundle): boolean;

  /**
   * Gets the field at the corresponding offset [key1, key2, key3]
   */
  get(bundle: PrimitiveBundle, key1: T | T[], key2: S | S[], key3: U | U[]): string;

  /**
   * Full mapping of all keys to the corresponding fields.
   */
  mapping(bundle: PrimitiveBundle): { [P in T]: { [Q in S]: { [R in U]: string } } };
}

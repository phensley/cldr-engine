/**
 * Immutable pair of values of different types.
 */
export class Pair<T, R> {
  constructor(readonly _1: T, readonly _2: R) {}
}

/**
 * Shortcut for constructing a Pair<T, R>.
 */
export const pair = <T, R>(_1: T, _2: R) => new Pair(_1, _2);

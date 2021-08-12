/**
 * Interface for a value that may not be there.
 */
export interface Maybe<T> {
  isJust(): boolean;
  isNothing(): boolean;
  get(): T;
  map<R>(f: (value: T) => R): Maybe<R>;
  flatMap<R>(f: (value: T) => Maybe<R>): Maybe<R>;
  orElse<R>(f: () => Maybe<R>): Maybe<T | R>;
}

/**
 * Class for a singleton object representing all values that are not there.
 */
export class Nothing<T> implements Maybe<T> {
  isJust(): boolean {
    return false;
  }

  isNothing(): boolean {
    return true;
  }

  get(): T {
    throw new Error('Cannot invoke get() on Nothing');
  }

  map<R>(_f: (v: T) => R): Maybe<R> {
    return this as any as Nothing<R>;
  }

  flatMap<R>(_f: (v: T) => Maybe<R>): Maybe<R> {
    return this as any as Nothing<R>;
  }

  orElse<R>(f: () => Maybe<R>): Maybe<T | R> {
    return f();
  }
}

/**
 * A value in the Maybe type.
 */
export class Just<T> implements Maybe<T> {
  constructor(readonly value: T) {}

  isJust(): boolean {
    return true;
  }

  isNothing(): boolean {
    return false;
  }

  get(): T {
    return this.value;
  }

  map<R>(f: (value: T) => R): Maybe<R> {
    return new Just(f(this.get()));
  }

  flatMap<R>(f: (value: T) => Maybe<R>): Maybe<R> {
    return f(this.get());
  }

  orElse<R>(_f: () => Maybe<R>): Maybe<T | R> {
    return this;
  }
}

/**
 * Singleton nothing value.
 */
export const nothing: Maybe<any> = new Nothing();

/**
 * Shorthand to create a Just<T>.
 */
export const just = <T>(value: T): Maybe<T> => new Just(value);

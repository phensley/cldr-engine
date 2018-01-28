/**
 * Interface for a value that may not be there.
 */
export interface IMaybe<T> {
  isJust(): boolean;
  isNothing(): boolean;
  get(): T;
  map<R>(f: (value: T) => R): IMaybe<R>;
  flatMap<R>(f: (value: T) => IMaybe<R>): IMaybe<R>;
  orElse<R>(f: () => IMaybe<R>): IMaybe<T | R>;
}

/**
 * Class for a singleton object representing all values that are not there.
 */
export class Nothing<T> implements IMaybe<T> {

  isJust(): boolean {
    return false;
  }

  isNothing(): boolean {
    return true;
  }

  get(): T {
    throw new Error('Cannot invoke get() on Nothing');
  }

  map<R>(f: (v: T) => R): IMaybe<R> {
    return (this as any) as Nothing<R>;
  }

  flatMap<R>(f: (v: T) => IMaybe<R>): IMaybe<R> {
    return (this as any) as Nothing<R>;
  }

  orElse<R>(f: () => IMaybe<R>): IMaybe<T | R> {
    return f();
  }
}

/**
 * A value in the Maybe type.
 */
export class Just<T> implements IMaybe<T> {

  constructor(
    readonly value: T) {}

  isJust(): boolean {
    return true;
  }

  isNothing(): boolean {
    return false;
  }

  get(): T {
    return this.value;
  }

  map<R>(f: (value: T) => R): IMaybe<R> {
    return new Just(f(this.get()));
  }

  flatMap<R>(f: (value: T) => IMaybe<R>): IMaybe<R> {
    return f(this.get());
  }

  orElse<R>(f: () => IMaybe<R>): IMaybe<T | R> {
    return this;
  }
}

/**
 * Singleton nothing value.
 */
export const nothing: IMaybe<any> = new Nothing();

/**
 * Shorthand to create a Just<T>.
 */
export const just = <T>(value: T): IMaybe<T> => new Just(value);

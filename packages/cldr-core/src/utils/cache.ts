import { LRU } from './lru';

/**
 * Links an arrow function to an LRU cache. The function converts
 * a string to a value of type T. The string itself is used as
 * the cache key.
 */
export class Cache<T> {

  private storage: LRU<string, T>;

  constructor(private parser: (s: string) => T, capacity: number) {
    this.storage = new LRU(capacity);
  }

  size(): number {
    return this.storage.size();
  }

  get(raw: string): T {
    let pattern = this.storage.get(raw);
    if (pattern === undefined) {
      pattern = this.parser(raw);
      this.storage.set(raw, pattern);
    }
    return pattern;
  }

}

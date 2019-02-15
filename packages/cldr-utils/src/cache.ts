import { LRU } from './lru';

/**
 * Links an arrow function to an LRU cache. The function converts
 * a string to a value of type T. The string itself is used as
 * the cache key.
 *
 * Examples:
 *  * Caching a number or date pattern. The cache key is the string
 *    representation of the pattern.
 *  * Caching any object that is expensive to create, where the cache
 *    key identifies the type of object to cache.
 */
export class Cache<T> {

  private storage: LRU<T>;

  constructor(private builder: (s: string) => T, capacity: number) {
    this.storage = new LRU(capacity);
  }

  size(): number {
    return this.storage.size();
  }

  get(raw: string): T {
    let o = this.storage.get(raw);
    if (o === undefined) {
      o = this.builder(raw);
      this.storage.set(raw, o);
    }
    return o;
  }

}

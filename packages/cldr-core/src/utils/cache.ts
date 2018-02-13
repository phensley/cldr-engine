import { LRU } from './lru';

export class PatternCache<T> {

  private storage: LRU<string, T>;

  constructor(private parser: (s: string) => T, capacity: number) {
    this.storage = new LRU(capacity);
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

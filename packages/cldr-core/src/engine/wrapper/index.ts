import { Cache } from '../../utils/cache';
import { WrapperNode, parseWrapperPattern } from '../../parsing/patterns/wrapper';

export class WrapperInternal {

  private readonly wrapperPatternCache: Cache<WrapperNode[]>;

  constructor(cacheSize: number = 50) {
    this.wrapperPatternCache = new Cache(parseWrapperPattern, cacheSize);
  }

  format(format: string, args: string[]): string {
    const pattern = this.wrapperPatternCache.get(format);
    let res = '';
    for (const node of pattern) {
      if (typeof node === 'string') {
        res += node;
      } else {
        res += args[node] || '';
      }
    }
    return res;
  }
}

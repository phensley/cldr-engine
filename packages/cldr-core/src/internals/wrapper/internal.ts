import { WrapperInternals } from '..';
import { Cache } from '../../utils/cache';
import { WrapperNode, parseWrapperPattern } from '../../parsing/patterns/wrapper';
import { Part } from '../../types';

export class WrapperInternalsImpl implements WrapperInternals {

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

  formatParts(format: string, args: Part[][]): Part[] {
    const pattern = this.wrapperPatternCache.get(format);
    let res: Part[] = [];
    for (const node of pattern) {
      if (typeof node === 'string') {
        res.push({ type: 'literal', value: node });
      } else {
        const arg = args[node];
        if (arg !== undefined) {
          res = res.concat(arg);
        }
      }
    }
    return res;
  }
}

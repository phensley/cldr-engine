import { Constants, FNV } from './fnv';

/**
 * FNV-1A incremental checksum.
 */
export class Checksum {

  private v: number = 0;

  constructor() {
    this.v = Constants.FNV1A_BASIS;
  }

  update(s: string): this {
    this.v = FNV(this.v, s);
    return this;
  }

  get(): number {
    return this.v;
  }
}

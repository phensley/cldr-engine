import { Constants, FNV } from './fnv';

/**
 * FNV-1A incremental checksum.
 *
 * @public
 */
export class Checksum {

  private v: number = 0;

  constructor() {
    this.v = Constants.FNV1A_BASIS;
  }

  /**
   * Add the string to the checksum.
   *
   * @public
   */
  update(s: string): this {
    this.v = FNV(this.v, s);
    return this;
  }

  /**
   * Get the checksum value.
   *
   * @public
   */
  get(): number {
    return this.v;
  }
}

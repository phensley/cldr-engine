const enum Constants {
  FNV1A_BASIS = 0x811C9DC5
}

/**
 * FNV-1A incremental checksum.
 */
export class Checksum {

  private v: number = 0;

  constructor() {
    this.v = Constants.FNV1A_BASIS;
  }

  update(s: string): this {
    let r = this.v;
    for (let i = 0; i < s.length; i++) {
      r ^= s.charCodeAt(i);
      r += ((r << 1) + (r << 4) + (r << 7) + (r << 8) + (r << 24));
    }
    this.v = r >>> 0;
    return this;
  }

  get(): number {
    return this.v;
  }
}

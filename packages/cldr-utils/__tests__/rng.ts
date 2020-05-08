import { createHash } from 'crypto';

export class RNG {
  private seed: string;
  private rng: () => number;

  constructor(seed: string) {
    const hash = createHash('sha256');
    hash.update(seed);
    this.seed = hash.digest().toString();
    this.rng = this.sfc32();
  }

  rand(): number {
    return this.rng();
  }

  xmur3(): () => number {
    const len = this.seed.length;
    let h = 1779033703 ^ len;
    for (let i = 0; i < this.seed.length; i++) {
      h = Math.imul(h ^ this.seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }

    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  sfc32(): () => number {
    const seed = this.xmur3();
    let a = seed();
    let b = seed();
    let c = seed();
    let d = seed();
    return () => {
      a >>>= 0;
      b >>>= 0;
      c >>>= 0;
      d >>>= 0;
      let t = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      d = (d + 1) | 0;
      t = (t + d) | 0;
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }
}

export class RandString {
  private rng: RNG;
  private len: number;

  constructor(seed: string, private chars: string) {
    this.rng = new RNG(seed);
    this.len = chars.length;
  }

  rand(n: number): string {
    let s = '';
    for (let i = 0; i < n; i++) {
      const r = (this.rng.rand() * this.len) | 0;
      s += this.chars[r];
    }
    return s;
  }
}

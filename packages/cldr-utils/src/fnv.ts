export const enum Constants {
  FNV1A_BASIS = 0x811C9DC5
}

/**
 * FNV-1A hasher. Expects r to be initialized by caller.
 */
export const FNV = (r: number, s: string): number => {
  for (let i = 0; i < s.length; i++) {
    r ^= s.charCodeAt(i);
    r += ((r << 1) + (r << 4) + (r << 7) + (r << 8) + (r << 24));
  }
  return r >>> 0;
};

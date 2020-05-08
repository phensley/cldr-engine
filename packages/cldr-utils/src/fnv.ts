/**
 * FNV-1A constants.
 *
 * @public
 */
export const enum Constants {
  FNV1A_BASIS = 0x811c9dc5,
}

/**
 * FNV-1A hasher. Expects r to be initialized by caller.
 *
 * @public
 */
export const FNV = (r: number, s: string): number => {
  for (let i = 0; i < s.length; i++) {
    r ^= s.charCodeAt(i);
    r += (r << 1) + (r << 4) + (r << 7) + (r << 8) + (r << 24);
  }
  return r >>> 0;
};

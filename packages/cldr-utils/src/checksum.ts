const enum Constants {
  BASIS = 0x811C9DC5
}

/**
 * Compute FNV-1a checksum on the input string. This assumes the
 * string has been converted to a UTF-8 Uint8Array, otherwise only the low
 * byte of each character would be summed.
 */
export const fnv1aChecksum = (s: Uint8Array) => {
  let r = Constants.BASIS;
  for (let i = 0; i < s.length; i++) {
    r ^= s[i];
    r += ((r << 1) + (r << 4) + (r << 7) + (r << 8) + (r << 24));
  }
  return r >>> 0;
};

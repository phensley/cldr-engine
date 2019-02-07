const { floor, pow } = Math;
const Z85CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#';
const Z85ENCDIVS = [4, 3, 2, 1, 0].map(n => pow(85, n));
const PAD = [0, 0, 0];

/**
 * Z85 converts an array of bytes to a string, encoding 4 bytes as 5 ASCII characters.
 * The result is 8-bit safe and can be embedded in JSON without escaping.
 */
export const z85Encode = (arr: Uint8Array | number[]): string => {
  // add padding to ensure length is evenly disible by 4
  let len = arr.length;
  const pad = len % 4 ? 4 - (len % 4) : 0;
  len += pad;

  let v = 0;
  let res = '' + pad; // first character indicates number of padding bytes

  let i = 0;
  while (i < len) {
    // accumulate 4 bytes in v
    v = (v * 256) + (arr[i++] || 0);
    if (i % 4) {
      continue;
    }

    // encode v as 5 characters
    for (const d of Z85ENCDIVS) {
      const j = floor(v / d) % 85;
      res += Z85CHARS[j];
    }
    v = 0;
  }

  return res;
};

/** Encode a 32-bit signed integer into a 32-bit unsigned integer. */
export const zigzag32Encode = (n: number) => (n << 1) ^ (n >> 31);

/**
 * Encode an unsigned 32-bit integer using a variable-length encoding,
 * returning an array of uint8
 */
export const vuintEncode = (nums: number[] | Uint8Array, f?: (x: number) => number): Uint8Array => {
  const len = nums.length;
   // over-allocate result array, as each 32-bit value can use up to 5 bytes
  const res = new Uint8Array(len * 5);
  let j = 0;
  for (let i = 0; i < len; i++) {
    let n = f ? f(nums[i]) : nums[i];
    if (n > 0) {
      // encode a positive integer
      while (n) {
        let v = n & 0x7f;
        if ((n >>= 7) > 0) {
          v |= 0x80;
        }
        res[j++] = v;
      }
    } else {
      // everything else is treated as zero
      res[j++] = 0;
    }
  }
  return res.subarray(0, j);
};

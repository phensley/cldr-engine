const { floor, pow } = Math;
const Z85CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#';
const Z85ENCDIVS = [4, 3, 2, 1, 0].map(n => pow(85, n));

/**
 * Z85 converts an array of bytes to a string, encoding 4 bytes as
 * 5 ASCII characters. The result is 8-bit safe and can be embedded
 * in JSON without escaping.
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

/**
 * Encode a number up to (MAX_SAFE_INTEGER / 2) as a 64-bit unsigned integer.
 *
 * We avoid bitwise operations which fail for numbers >= 2^31.
 */
export const zigzagEncode = (n: number) => n === 0 ? 0 : n < 0 ? ((n * -2) - 1) : (n * 2);

/**
 * Encode a 64-bit unsigned integer using a variable-length encoding,
 * returning an array of uint8. Supports up to Number.MAX_SAFE_INTEGER
 * We avoid bitwise operations which fail for numbers >= 2^31.
 */
export const vuintEncode = (nums: number[] | Uint8Array, f?: (x: number) => number): Uint8Array => {
  const len = nums.length;
   // over-allocate result array. each 64-bit value can use up to 8 bytes
  const res = new Uint8Array((len + 1) * 8);
  let j = 0;
  for (let i = -1; i < len; i++) {
    // prefix original length to output buffer
    let n = i === -1 ? len : f ? f(nums[i]) : nums[i];
    if (n > 0) {
      // encode a positive integer
      while (n) {
        const p = 0x80 * floor(n / 0x80);
        let v = n - p;
        n = floor(p / 0x80);
        if (n > 0) {
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


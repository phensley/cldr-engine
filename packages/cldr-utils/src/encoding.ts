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

const enum U {
  MBLEAD = 0x80, // 1000 0000
  MBMASK = 0x3f, // 0011 1111

  B2LEAD = 0xc0, // 1100 0000
  B3LEAD = 0xe0, // 1110 0000
  B4LEAD = 0xf0, // 1111 0000
}

/**
 * Convert a JavaScript UTF-16 string to UTF-8 bytes.
 *
 * Note: This isn't terribly fast, so I won't use it but will
 * leave in place for now.
 */
export const utf8Encode = (s: string): Uint8Array => {
  const r = new Uint8Array(s.length * 4);
  let i = 0;
  let j = 0;
  const len = s.length;
  while (i < len) {
    let c = s.charCodeAt(i);

    // Decode surrogate pair
    if (c >= 0xd800 && c <= 0xd8ff) {
      if (++i >= len) {
        break;
      }
      c = ((c - 0xD800) * 0x400) + s.charCodeAt(i) - 0xDC00 + 0x10000;
    }

    // Encode
    if (c < 0x80) {
      // 0zzzzzzz
      r[j++] = c;

    } else if (c < 0x800) {
      // 110yyyyy 10zzzzzz
      r[j++] = U.B2LEAD | c >> 6;
      r[j++] = U.MBLEAD | (c & U.MBMASK);

    } else if (c < 0x10000) {
      // 1110xxxx 10yyyyyy 10zzzzzz
      r[j++] = U.B3LEAD | c >> 12;
      r[j++] = U.MBLEAD | ((c >> 6) & U.MBMASK);
      r[j++] = U.MBLEAD | (c & U.MBMASK);

    } else if (c < 0x200000) {
      // 11110www 10xxxxxx 10yyyyyy 10zzzzzz
      r[j++] = U.B4LEAD | (c >> 18);
      r[j++] = U.MBLEAD | ((c >> 12) & U.MBMASK);
      r[j++] = U.MBLEAD | ((c >> 6) & U.MBMASK);
      r[j++] = U.MBLEAD | (c & U.MBMASK);
    }
    i++;
  }
  return r.subarray(0, j);
};

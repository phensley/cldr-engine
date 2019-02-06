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

const Z85DECBYTES = new Uint8Array([
  0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00,
  0x4B, 0x4C, 0x46, 0x41, 0x00, 0x3F, 0x3E, 0x45,
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47,
  0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A,
  0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32,
  0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A,
  0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00,
  0x00, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10,
  0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
  0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20,
  0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00
]);

/**
 * Decode a Z85-encoded string into an array of byte values. This decodes
 * 5 characters as 4 bytes.
 */
export const z85Decode = (s: string): Uint8Array => {
  const len = s.length - 1;
  const res = new Uint8Array((len / 5) * 4);

  const pad = s.charCodeAt(0) - 0x30;
  let i = 0; // input index
  let j = 0; // output index
  let v = 0, ix = 0;

  while (i < len) {
    // accumulate 5 characters into v
    ix = s.charCodeAt(1 + i++) - 32;
    v = (v * 85) + Z85DECBYTES[ix];
    if (i % 5) {
      continue;
    }

    // decode v as 4 bytes
    res[j++] = ((v >> 24) | 0) & 0xff;
    res[j++] = ((v >> 16) | 0) & 0xff;
    res[j++] = ((v >> 8) | 0) & 0xff;
    res[j++] = v & 0xff;
    v = 0;
  }

  // remove padding bytes
  return pad > 0 ? res.subarray(0, res.length - pad) : res;
};

/** Encode a 32-bit signed integer into a 32-bit unsigned integer. */
export const zigzag32Encode = (n: number) => (n << 1) ^ (n >> 31);

/** Decode a 32-bit unsigned integer as a 32-bit signed integer. */
export const zigzag32Decode = (n: number) => (n >>> 1) ^ -(n & 1);

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

/**
 * Decodes a variable-length unsigned 32-bit integer from the given
 * byte array, writing the decoded integers back to the same array.
 * An optional mapping function can be supplied to transform each
 * integer before it is appended to the buffer.
 */
export const vuintDecode = (arr: number[] | Uint8Array, f?: (x: number) => number): number[] => {
  let i = 0, j = 0, k = 0, n = 0;
  const len = arr.length;
  const res: number[] = new Array(len);
  while (i < len) {
    n += (arr[i] & 0x7f) << k;
    k += 7;
    // detect last byte for this variable int
    if (!(arr[i] & 0x80)) {
      // write the decoded integer to the same buffer and
      // reset the state
      res[j++] = f ? f(n) : n;
      n = k = 0;
    }
    i++;
  }
  // truncate array to hold only the decoded integers
  res.length = j;
  return res;
};

export const bitarrayCreate = (bits: number[]): number[] => {
  const data: number[] = new Array((bits.length >>> 5) + 1);
  for (let i = 0; i < bits.length; i++) {
    const idx = i >>> 5;
    const bit = bits[i];
    if (bit === 0) {
      data[idx] &= ~(1 << i);
    } else {
      data[idx] |= (1 << i);
    }
  }
  return data;
};

export const bitarrayGet = (data: number[], i: number): boolean => {
  const idx = i >>> 5;
  return idx < data.length ? ((data[idx] >>> (i % 32)) & 1) === 1 : false;
};

// =====================================================================
// TODO: the base-100 encoder is deprecated and will be removed once the
// new encoding for timezone rules is completed.

// Simple base-100 UTF-8-safe encoding of numbers. With 64-bit bitwise
// operations we could do a variable-length encoding of numbers up to
// Number.MAX_SAFE_INTEGER. Since JavaScript's bitwise operations only
// support 32-bit numbers, we do this compromise.

// The minus symbol is reserved to indicate negative numbers, and period is
// reserved in case of future support of encoding floating point numbers.

export const ENCODE = '' +
  '!#$%&()*+,0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '[]^_abcdefghijklmnopqrstuvwxyz{|}~¢£¥¦§©«±µ»¼½¾';

const DECODE = ENCODE.split('').reduce((o: any, ch, i) => {
  o[ch] = i;
  return o;
}, {});

export const base100encode = (orig: number): string => {
  if (orig === 0) {
    return ENCODE[0];
  }
  let res = orig < 0 ? '-' : '';
  let n = Math.abs(orig);
  while (n >= 100) {
    const i = n % 100;
    res += ENCODE[i];
    n = Math.floor(n / 100);
  }
  return n > 0 ? res + ENCODE[n] : res;
};

export const base100decode = (s: string): number => {
  const len = s.length;
  if (len === 0) {
    return 0;
  }
  const lim = s[0] === '-' ? 1 : 0;
  let n = 0;
  for (let i = s.length - 1; i >= lim; i--) {
    const ch = s[i];
    n *= 100;
    n += DECODE[ch];
  }
  return lim === 1 ? -n : n;
};

import { vuintDecode, z85Decode, zigzagDecode } from '../src/decoding';
import { utf8Encode, vuintEncode, z85Encode, zigzagEncode } from '../src/encoding';

const uint8 = (n: number[]) => new Uint8Array(n);

test('variable uint encode', () => {
  const enc = vuintEncode;

  // encoding for numbers < 128 is identity
  let nums = [0, 1, 4, 8, 32, 64];
  let res = enc(nums);
  expect(res).toEqual(uint8([6, 0, 1, 4, 8, 32, 64]));

  // encoding for numbers >= 128 uses 2 or more bytes
  nums = [128, 256, 512, 1024, 2048, 4096];
  res = enc(nums);
  expect(res).toEqual(uint8(
    [6, 128, 1, 128, 2, 128, 4, 128, 8, 128, 16, 128, 32]));

  // if negative numbers are passed in, they become zeros
  nums = [-1, -2, -3, -4, -5];
  res = enc(nums);
  expect(res).toEqual(uint8([5, 0, 0, 0, 0, 0]));
});

test('variable uint decode', () => {
  // encode some random positive integers in a range
  const nums: number[] = [0];
  for (let i = 0; i < 100000; i++) {
    const n = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    nums.push(n);
  }

  // encode, then decode in-place and check
  const tmp = vuintEncode(nums);
  const res = vuintDecode(tmp);
  expect(res).toEqual(nums);
});

test('variable uint encode w/mapping', () => {
  const nums: number[] = [1, 2, 4, 5, 7, 11, 17];
  const tmp = vuintEncode(nums, n => n * 2);
  const res = vuintDecode(tmp);
  expect(res).toEqual([2, 4, 8, 10, 14, 22, 34]);
});

test('variable uint decode w/ mapping', () => {
  const nums: number[] = [1, 2, 4, 5, 7, 11, 17];
  const tmp = vuintEncode(nums);
  const res = vuintDecode(tmp, n => n * 2);
  expect(res).toEqual([2, 4, 8, 10, 14, 22, 34]);
});

test('z85 encode', () => {
  const enc = z85Encode;

  expect(enc([0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3])).toEqual('0000010000200003');
  expect(
    enc(uint8([0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3]))).toEqual('0000010000200003');

  // play with powers of 256 / 85
  expect(enc([3, 38, 0, 45])).toEqual('011111');
  expect(enc([6, 76, 0, 90])).toEqual('022222');
  expect(enc([3, 47, 152, 143])).toEqual('012345');

  // padding
  expect(enc([0])).toEqual('300000');
  expect(enc([0, 0])).toEqual('200000');
  expect(enc([0, 0, 0])).toEqual('100000');
  expect(enc([0, 0, 0, 0])).toEqual('000000');
});

test('z85 decode', () => {
  const enc = z85Encode;
  const dec = z85Decode;

  const lim = 100000;
  const nums = new Uint8Array(lim);
  for (let i = 0; i < lim; i++) {
    nums[i] = Math.floor(Math.random() * 255);
  }

  const s = enc(nums);
  const d = dec(s);
  expect(d).toEqual(nums);

  // padding
  expect(dec(enc([0]))).toEqual(uint8([0]));
  expect(dec(enc([0, 0]))).toEqual(uint8([0, 0]));
  expect(dec(enc([0, 0, 0]))).toEqual(uint8([0, 0, 0]));
  expect(dec(enc([0, 0, 0, 0]))).toEqual(uint8([0, 0, 0, 0]));
});

test('zigzag encode', () => {
  const enc = zigzagEncode;
  expect(enc(0)).toEqual(0);
  expect(enc(-1)).toEqual(1);
  expect(enc(1)).toEqual(2);
  expect(enc(-2)).toEqual(3);
  expect(enc(2)).toEqual(4);
});

test('zigzag decode', () => {
  const dec = zigzagDecode;
  expect(dec(0)).toEqual(0);
  expect(dec(1)).toEqual(-1);
  expect(dec(2)).toEqual(1);
  expect(dec(3)).toEqual(-2);
  expect(dec(4)).toEqual(2);
});

test('utf-8 encode', () => {
  // 'Íñţĕŕňāţĩōņąļĭžę'
  let input = '\xcd\xf1\u0163\u0115\u0155\u0148\u0101\u0163\u0129\u014d' + '\u0146\u0105\u013c\u012d\u017e\u0119';
  expect(utf8Encode(input)).toEqual(uint8([
    0xc3, 0x8d, 0xc3, 0xb1, 0xc5, 0xa3, 0xc4, 0x95, 0xc5, 0x95, 0xc5, 0x88, 0xc4,
    0x81, 0xc5, 0xa3, 0xc4, 0xa9, 0xc5, 0x8d, 0xc5, 0x86, 0xc4, 0x85, 0xc4, 0xbc,
    0xc4, 0xad, 0xc5, 0xbe, 0xc4, 0x99
  ]));

  // MDN String.fromCodePoint example '☃★♲你' inclues a surrogate pair
  input = '\u2603 \u2605 \u2672 \ud87e\udc04';
  expect(utf8Encode(input)).toEqual(uint8([
    0xe2, 0x98, 0x83, 0x20, 0xe2, 0x98, 0x85, 0x20, 0xe2, 0x99, 0xb2, 0x20, 0xf0,
    0xaf, 0xa0, 0x84
  ]));

  // Cases from Go examples
  expect(utf8Encode('A')).toEqual(uint8([0x41]));
  expect(utf8Encode('ö')).toEqual(uint8([0xc3, 0xb6]));
  expect(utf8Encode('Ж')).toEqual(uint8([0xd0, 0x96]));
  expect(utf8Encode('€')).toEqual(uint8([0xe2, 0x82, 0xac]));
  expect(utf8Encode('𝄞')).toEqual(uint8([0xf0, 0x9d, 0x84, 0x9e]));
});

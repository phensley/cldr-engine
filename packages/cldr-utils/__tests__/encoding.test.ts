import { base100decode, base100encode } from '../src/base100';
import { bitarrayCreate, bitarrayGet } from '../src/bitarray';
import { vuintDecode, z85Decode, zigzag32Decode } from '../src/decoding';
import { vuintEncode, z85Encode, zigzag32Encode } from '../src/encoding';

const uint8 = (n: number[]) => new Uint8Array(n);

// TODO: base-100 is deprecated and will be removed
test('base100 encoding', () => {
  expect(base100encode(0)).toEqual('!');

  const nums = [Number.MIN_SAFE_INTEGER, -135, -1, 0, 1, 135, Number.MAX_SAFE_INTEGER];
  const encoded = nums.map(base100encode).join(' ');
  const decoded = encoded.split(' ').map(base100decode);
  expect(decoded).toEqual(nums);
});

test('bit array', () => {
  const bits = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1];
  const data = bitarrayCreate(bits);
  for (let i = 0; i < bits.length; i++) {
    expect(bitarrayGet(data, i)).toEqual(bits[i] === 1 ? true : false);
  }
});

test('variable uint encode', () => {
  const enc = vuintEncode;

  // encoding for numbers < 128 is identity
  let nums = [0, 1, 4, 8, 32, 64];
  let res = enc(nums);
  expect(res).toEqual(uint8(nums));

  // encoding for numbers >= 128 uses 2 or more bytes
  nums = [128, 256, 512, 1024, 2048, 4096];
  res = enc(nums);
  expect(res).toEqual(uint8([128, 1, 128, 2, 128, 4, 128, 8, 128, 16, 128, 32]));

  // if negative numbers are passed in, they become zeros
  nums = [-1, -2, -3, -4, -5];
  res = enc(nums);
  expect(res).toEqual(uint8([0, 0, 0, 0, 0]));
});

test('variable uint decode', () => {
  const dec = vuintDecode;

  // encode some random positive integers in a range
  const nums: number[] = [0];
  for (let i = 0; i < 100000; i++) {
    const n = Math.floor(Math.random() * 1000000000);
    nums.push(n);
  }

  // encode, then decode in-place and check
  const tmp = vuintEncode(nums);
  const res = vuintDecode(tmp);
  expect(res).toEqual(nums);
});

test('variable uint decode w/ mapping', () => {
  const nums: number[] = [1, 2, 4, 5, 7, 11, 17];
  const tmp = vuintEncode(nums);
  const res = vuintDecode(tmp, n => n * 2);
  expect(res).toEqual([2, 4, 8, 10, 14, 22, 34]);
});

// test('variable uint array encode', () => {
//   const enc = vuintEncodeArray;
//   const dec = vuintDecode;
//   const nums = [-16, 5, 0, 17, 32];
//   const tmp = enc(nums, zigzag32Encode);
//   const res = dec(tmp, zigzag32Decode);
//   expect(res).toEqual(nums);
// });

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
  const enc = zigzag32Encode;
  expect(enc(0)).toEqual(0);
  expect(enc(-1)).toEqual(1);
  expect(enc(1)).toEqual(2);
  expect(enc(-2)).toEqual(3);
  expect(enc(2)).toEqual(4);
});

test('zigzag decode', () => {
  const dec = zigzag32Decode;
  expect(dec(0)).toEqual(0);
  expect(dec(1)).toEqual(-1);
  expect(dec(2)).toEqual(1);
  expect(dec(3)).toEqual(-2);
  expect(dec(4)).toEqual(2);
});
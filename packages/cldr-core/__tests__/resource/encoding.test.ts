import {
  base100decode,
  base100encode,
  bitarrayCreate,
  bitarrayGet } from '../../src/resource/encoding';

test('encode', () => {
  expect(base100encode(0)).toEqual('!');
});

test('round-trip', () => {
  const nums = [Number.MIN_SAFE_INTEGER, -135, -1, 0, 1, 135, Number.MAX_SAFE_INTEGER];
  const encoded = nums.map(base100encode).join(' ');
  const decoded = encoded.split(' ').map(base100decode);
  expect(decoded).toEqual(nums);
});

test('another', () => {
  const bits = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1];
  const data = bitarrayCreate(bits);
  for (let i = 0; i < bits.length; i++) {
    expect(bitarrayGet(data, i)).toEqual(bits[i] === 1 ? true : false);
  }
});

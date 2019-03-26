import { makeSuite } from './util';
import { vuintDecode, vuintEncode } from '../src';

export const vuintSuite = makeSuite('vuint');

const LIM = 500;

// encode some random positive integers in a range
const NUMS: number[] = [];
for (let i = 0; i < LIM; i++) {
  NUMS.push(Number.MAX_SAFE_INTEGER);
}

const ENCODED = vuintEncode(NUMS);

vuintSuite.add('vuint encode', () => {
  vuintEncode(NUMS);
});

vuintSuite.add('vuint decode', () => {
  vuintDecode(ENCODED);
});

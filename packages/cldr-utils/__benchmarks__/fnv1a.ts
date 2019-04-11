import { makeSuite } from './util';
import { Checksum } from '../src';

export const fnv1aSuite = makeSuite('FNV1a');

const makestr = (n: number, base: string) => base.repeat(n);

const N = 1000;
const BYTE1 = makestr(N, 'A');
const BYTE2 = makestr(N, 'Ж');
const BYTE3 = makestr(N, '€');
const BYTE4 = makestr(N, '𝄞');

fnv1aSuite.add('1-byte sequence', () => {
  new Checksum().update(BYTE1).get();
});

fnv1aSuite.add('2-byte sequence', () => {
  new Checksum().update(BYTE2).get();
});

fnv1aSuite.add('3-byte sequence', () => {
  new Checksum().update(BYTE3).get();
});

fnv1aSuite.add('4-byte sequence', () => {
  new Checksum().update(BYTE4).get();
});

import { makeSuite } from './util';
import { utf8Encode } from '../src/encoding';

export const utfSuite = makeSuite('UTF-8');

const makestr = (n: number, base: string) => base.repeat(n);

const N = 1;
const BYTE1 = makestr(N, 'A');
const BYTE2 = makestr(N, 'Ж');
const BYTE3 = makestr(N, '€');
const BYTE4 = makestr(N, '𝄞');

utfSuite.add('utf-8 1-byte sequence', () => {
  utf8Encode(BYTE1);
});

utfSuite.add('utf-8 2-byte sequence', () => {
  utf8Encode(BYTE2);
});

utfSuite.add('utf-8 3-byte sequence', () => {
  utf8Encode(BYTE3);
});

utfSuite.add('utf-8 4-byte sequence', () => {
  utf8Encode(BYTE4);
});

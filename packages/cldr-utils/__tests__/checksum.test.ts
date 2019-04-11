import { fnv1aChecksum, utf8Encode } from '../src';

/*

https://tools.ietf.org/html/draft-eastlake-fnv-16#page-114

Appendix C: A Few Test Vectors

   Below are a few test vectors in the form of ASCII strings and their
   FNV32 and FNV64 hashes using the FNV-1a algorithm.

         Strings without null (zero byte) termination:

         String       FNV32
          ""        0x811c9dc5
          "a"       0xe40c292c
          "foobar"  0xbf9cf968

*/

test('fnv1a test vectors', () => {
  const check = (s: string) => fnv1aChecksum(utf8Encode(s));

  expect(check('')).toEqual(0x811c9dc5);
  expect(check('a')).toEqual(0xe40c292c);
  expect(check('foobar')).toEqual(0xbf9cf968);
  expect(check('hello world')).toEqual(0xd58b3fa7);
  expect(check('\u2018hello\u2019')).toEqual(0xd5cc4918);
});

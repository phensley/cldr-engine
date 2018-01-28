import { matcher } from '../../src/parsing';
import { just, nothing } from '../../src/parsing';
import { pair } from '../../src/parsing';

test('basic 1', () => {
  const parser = matcher(/^\d/).zeroOrMore();
  expect(parser.parse('')).toEqual(just(pair([], '')));
  expect(parser.parse('@!')).toEqual(just(pair([], '@!')));
  expect(parser.parse('123')).toEqual(just(pair(['1', '2', '3'], '')));
});

test('basic 2', () => {
  const sep = matcher(/^[\s,]+/);
  const parser = matcher(/^\d+/).map(v => parseInt(v, 10)).separatedBy(sep);
  expect(parser.parse('1,23,456')).toEqual(just(pair([1, 23, 456], '')));
  expect(parser.parse(',1')).toEqual(nothing);
});

test('suffix', () => {
  const sep = matcher(/^[\s,]+/);
  const colon = matcher(/^:/);
  const parser = matcher(/^\d+/).suffix(colon).map(v => parseInt(v, 10)).separatedBy(sep);
  expect(parser.parse('1:,2:,3:')).toEqual(just(pair([1, 2, 3], '')));
});

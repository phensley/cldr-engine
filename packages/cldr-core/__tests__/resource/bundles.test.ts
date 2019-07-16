import { parseLanguageTag, Bundle, StringBundle } from '../../src';
import { languageBundle } from '../_helpers';

test('bundle loading', () => {
  let b: Bundle;

  b = languageBundle('en-u-nu-hant-ca-buddhist');
  expect(b.id()).toEqual('en-Latn-US-u-ca-buddhist-nu-hant');
  expect(b.language()).toEqual('en');
  expect(b.region()).toEqual('US');
  expect(b.languageScript()).toEqual('en-Latn');
  expect(b.languageRegion()).toEqual('en-US');
  expect(b.calendarSystem()).toEqual('buddhist');
  expect(b.numberSystem()).toEqual('hant');
});

test('bundle unicode extension defaulting', () => {
  let b: Bundle;

  b = languageBundle('en-u-co-foo');
  expect(b.numberSystem()).toEqual('default');
  expect(b.calendarSystem()).toEqual('');
});

test('bundle index', () => {
  const tag = parseLanguageTag('en-XX');
  const b = new StringBundle('en-XX', tag, ['A', 'B'], [], {}, {});
  expect(b.get(0)).toEqual('A');
  expect(b.get(1)).toEqual('B');
  expect(b.get(2)).toEqual('');
});

test('bundle exceptions', () => {
  const tag = parseLanguageTag('en-XX');
  const b = new StringBundle('en-XX', tag, ['A', 'B'], ['C'], { 1: 0 }, {});
  expect(b.get(0)).toEqual('A');
  expect(b.get(1)).toEqual('C');
  expect(b.get(2)).toEqual('');
});

test('bundle exception missing', () => {
  const tag = parseLanguageTag('en-XX');
  const b = new StringBundle('en-XX', tag, ['A', 'B'], ['C'], { 0: 0, 1: 5 }, {});
  expect(b.get(0)).toEqual('C');
  expect(b.get(1)).toEqual('');
  expect(b.get(2)).toEqual('');
});

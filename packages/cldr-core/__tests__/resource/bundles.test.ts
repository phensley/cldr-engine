import { Bundle } from '../../src';
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

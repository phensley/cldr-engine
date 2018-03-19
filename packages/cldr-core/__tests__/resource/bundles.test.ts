import { languageBundle } from '../_helpers';

test('bundle loading', () => {
  const en = languageBundle('en-u-nu-hant');
  expect(en.numberSystem()).toEqual('hant');
});

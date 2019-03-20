import { languageBundle } from '../../_helpers';
import { GeneralImpl, InternalsImpl, Locale } from '../../../src';

const INTERNALS = new InternalsImpl();

const generalApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new GeneralImpl(bundle, Locale.resolve(tag), INTERNALS);
};

test('character order', () => {
  let api = generalApi('en');
  expect(api.characterOrder()).toEqual('ltr');

  api = generalApi('ar-IL');
  expect(api.characterOrder()).toEqual('rtl');
});

test('line order', () => {
  let api = generalApi('en');
  expect(api.lineOrder()).toEqual('ttb');

  api = generalApi('ar-IL');
  expect(api.lineOrder()).toEqual('ttb');
});

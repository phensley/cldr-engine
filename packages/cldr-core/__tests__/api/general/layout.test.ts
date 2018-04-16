import { languageBundle } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Bundle, GeneralImpl, InternalsImpl } from '../../../src';

const INTERNALS = new InternalsImpl();

const generalApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new GeneralImpl(bundle, INTERNALS);
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

import { AR_IL, EN } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Bundle, GeneralImpl, InternalsImpl } from '../../../src';

const INTERNALS = new InternalsImpl();

const generalApi = (bundle: Bundle) => new GeneralImpl(bundle, INTERNALS);

test('character order', () => {
  let api = generalApi(EN);
  expect(api.characterOrder()).toEqual('ltr');

  api = generalApi(AR_IL);
  expect(api.characterOrder()).toEqual('rtl');
});

test('line order', () => {
  let api = generalApi(EN);
  expect(api.lineOrder()).toEqual('ttb');

  api = generalApi(AR_IL);
  expect(api.lineOrder()).toEqual('ttb');
});

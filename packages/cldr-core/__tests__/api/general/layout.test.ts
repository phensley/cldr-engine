import { generalApi } from '../../_helpers';

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

import { generalApi } from '../../_helpers';

const api = generalApi;

test('locales', () => {
  expect(api('en').bundle().id()).toEqual('en-Latn-US');
  expect(api('en_US').bundle().id()).toEqual('en-Latn-US');
  expect(api('zh_Hans').bundle().id()).toEqual('zh-Hans-CN');

  expect(api('en').locale().id).toEqual('en');
  expect(api('en_US').locale().id).toEqual('en_US');
  expect(api('zh_Hans').locale().id).toEqual('zh_Hans');

  const en = api('en');
  let locale = en.resolveLocale('und-Latn');
  expect(locale.id).toEqual('und-Latn');
  expect(locale.tag.compact()).toEqual('en-Latn-US');

  const { tag } = locale;
  locale = en.resolveLocale(tag);
  expect(locale.id).toEqual('en-Latn-US');
  expect(locale.tag.compact()).toEqual('en-Latn-US');
});

test('language tags', () => {
  expect(api('en').parseLanguageTag('en').expanded()).toEqual('en-Zzzz-ZZ');
});

import { availableLocales, LanguageResolver, LanguageTag, Locale } from '../../src';

test('available locales', () => {
  let locales = availableLocales();
  let tag: LanguageTag;

  for (const id of ['en', 'zh', 'ko', 'fr', 'ar', 'en-GB', 'de', 'es-419']) {
    tag = LanguageResolver.resolve(id);
    const locale: Locale = { id, tag };
    expect(locales).toContainEqual(locale);
  }

  // fetch again for coverage
  locales = availableLocales();
  tag = LanguageResolver.resolve('gu');
  expect(locales).toContainEqual({ id: 'gu', tag });
});

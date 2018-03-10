import { availableLocales, LanguageResolver } from '../../src';

test('available locales', () => {
  const locales = availableLocales();
  for (const id of ['en', 'zh', 'ko', 'fr', 'ar', 'en-GB', 'de', 'es-419']) {
    const tag = LanguageResolver.resolve(id);
    const locale = { id, tag };
    expect(locales).toContainEqual(locale);
  }
});

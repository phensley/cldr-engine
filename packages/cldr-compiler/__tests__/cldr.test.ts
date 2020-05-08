import { availableLocales, getExtensions, getMain, getSupplemental, load } from '../src/cldr';

test('load missing', () => {
  expect(load('missing', true)).toEqual({});
  expect(() => load('missing')).toThrowError();
});

test('main', () => {
  const en = getMain('en-001');
  expect(en.Numbers.numberSystem.latn.currencyFormats.standard).toEqual('¤#,##0.00');
  expect(en.Gregorian.format.weekdays.wide['1']).toEqual('Sunday');
});

test('supplemental', () => {
  const s = getSupplemental();
  expect(s.Aliases.languageAlias['i-klingon']).toEqual('tlh');
  expect(s.TerritoryContainment.EU._contains).toContainEqual('FR');
});

test('extensions', () => {
  const e = getExtensions();
  expect(e.LanguageMatching.languageMatch).toContainEqual({ desired: 'no', supported: 'nb', distance: '1' });
  expect(e.PluralRanges.ko).toEqual([{ start: 'other', end: 'other', result: 'other' }]);
});

test('locales', () => {
  const locales = availableLocales();
  expect(locales).toContainEqual('en-001');
});

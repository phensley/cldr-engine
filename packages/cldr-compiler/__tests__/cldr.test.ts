import { getMain, getSupplemental, availableLocales } from '../src/cldr';

test('main', () => {
  const en = getMain('en-001');
  expect(en.Numbers.currencyFormats.standard).toEqual('¤#,##0.00');
  expect(en.Gregorian.weekdays.format.wide.sun).toEqual('Sunday');
});

test('supplemental', () => {
  const s = getSupplemental();
  expect(s.Aliases.languageAlias['i-klingon']).toEqual('tlh');
  expect(s.TerritoryContainment.EU._contains).toContainEqual('FR');
});

test('locales', () => {
  const locales = availableLocales();
  expect(locales).toContainEqual('en-001');
});

import { LanguageResolver } from '../../src/locale/resolver';
import { LocaleMatcher } from '../../src/locale/matcher';
import { loadMatchCases } from './util';

const resolve = LanguageResolver.resolve;

test('basics', () => {
  const m = new LocaleMatcher('en, en_GB, zh, pt_AR, es-419');
  expect(m.match('en-AU')).toEqual({ locale: { id: 'en_GB', tag: resolve('en-GB') }, distance: 3 });
});

test('constructor args', () => {
  const expected = { locale: { id: 'en_GB', tag: resolve('en_GB') }, distance: 3 };
  let m = new LocaleMatcher('en \t en_GB \n , zh');
  expect(m.match('en-AU')).toEqual(expected);

  m = new LocaleMatcher([' en, pt_AR ', '\t en_GB']);
  expect(m.match('en-AU')).toEqual(expected);
});

loadMatchCases().forEach((c, i) => {
  test(`locale-match-cases.txt - line ${c.lineno}`, () => {
    const m = new LocaleMatcher(c.supported);
    const result = m.match(c.desired);
    expect(result.locale.id).toEqual(c.result);
  });
});

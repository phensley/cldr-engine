import { LanguageResolver } from '../../src/locale/resolver';
import { LanguageMatch, LocaleMatcher } from '../../src/locale/matcher';
import { loadMatchCases } from './util';

const resolve = LanguageResolver.resolve;

test('basics', () => {
  const matcher = new LocaleMatcher('en, en_GB, zh, pt_AR, es-419');
  const m: LanguageMatch = matcher.match('en-AU');
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('en_GB');
});

test('constructor args', () => {
  const expected = { locale: { id: 'en_GB', tag: resolve('en_GB') }, distance: 3 };
  let matcher: LocaleMatcher;
  let m: LanguageMatch;

  matcher = new LocaleMatcher('en \t en_GB \n , zh');
  m = matcher.match('en-AU');
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('en_GB');

  matcher = new LocaleMatcher([' en, pt_AR ', '\t en_GB']);
  m = matcher.match('en-AU');
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('en_GB');
});

test('extensions', () => {
  const m = new LocaleMatcher('en, fr, fa, es');
  const r = m.match('en-AU-u-ca-persian');
  expect(r.distance).toEqual(5);
  const { id, tag } = r.locale;
  expect(id).toEqual('en');
  expect(tag.region()).toEqual('US');
  expect(tag.extensions()).toEqual({ u: ['ca-persian'] });
});

loadMatchCases().forEach((c, i) => {
  test(`locale-match-cases.txt - line ${c.lineno}`, () => {
    const m = new LocaleMatcher(c.supported);
    const result = m.match(c.desired);
    expect(result.locale.id).toEqual(c.result);
  });
});

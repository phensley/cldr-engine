import { LocaleMatch, LocaleMatcher } from '../src';
import { loadMatchCases } from './util';

test('basics', () => {
  const matcher = new LocaleMatcher('en, en_GB, zh, pt_AR, es-419');
  const m: LocaleMatch = matcher.match('en-AU');
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('en_GB');
});

test('bad args', () => {
  expect(() => new LocaleMatcher(undefined as unknown as string)).toThrowError('at least');
});

test('constructor args', () => {
  let matcher: LocaleMatcher;
  let m: LocaleMatch;

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

loadMatchCases().forEach(c => {
  test(`locale-match-cases.txt - line ${c.lineno}`, () => {
    const m = new LocaleMatcher(c.supported);
    const result = m.match(c.desired);
    expect(result.locale.id).toEqual(c.result);
  });
});

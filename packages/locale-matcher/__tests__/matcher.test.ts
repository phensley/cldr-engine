import { parseLanguageTag, LanguageTag } from '@phensley/language-tag';
import { Locale } from '@phensley/locale';
import { LocaleMatch, LocaleMatcher } from '../src';
import { loadMatchCases } from './util';
import { parse, sortEntries } from '../src/matcher';

test('basics', () => {
  const matcher = new LocaleMatcher('en, en_GB, zh, pt_AR, es-419');
  let m: LocaleMatch;

  m = matcher.match('en-AU');
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('en_GB');

  // Unknown languages match default supported locale with max. distance
  m = matcher.match(['xx', 'yy']);
  expect(m.distance).toEqual(100);
  expect(m.locale.id).toEqual('en');

  // Distance 100 indicates none of the desired locales match (since the
  // argument is empty) and default supported locale was returned
  m = matcher.match([]);
  expect(m.distance).toEqual(100);
  expect(m.locale.id).toEqual('en');
});

test('entry sort', () => {
  const entries = parse('en en-GB fr-FR');
  const en = entries[0];
  const enGB = entries[1];
  const frFR = entries[2];

  const f = sortEntries(en);

  // 'en' is default, should always be first
  expect(f(en, enGB)).toEqual(-1);
  expect(f(enGB, en)).toEqual(1);

  // 'en-GB' is a paradigm locale, should always be first
  expect(f(enGB, frFR)).toEqual(-1);
  expect(f(frFR, enGB)).toEqual(1);
});

test('threshold', () => {
  const matcher = new LocaleMatcher('en, en_GB, zh, pt_AR, es-419');
  let m: LocaleMatch;

  m = matcher.match('en-AU', 10);
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('en_GB');

  // Distance 100 indicates match wasn't within threshold and default
  // supported locale was returned
  m = matcher.match('en-AU', 1);
  expect(m.distance).toEqual(100);
  expect(m.locale.id).toEqual('en');
});

test('no resolve', () => {
  let matcher = new LocaleMatcher('en en_GB', { resolve: false });
  let m: LocaleMatch;

  // Missing subtags cause matcher to fail
  m = matcher.match('en-AU');
  expect(m.distance).toEqual(100);
  expect(m.locale.id).toEqual('en');

  // Supported locales have all relevant subtags so matcher has enough
  // information for proper distance computation
  matcher = new LocaleMatcher('en-Latn-US en-Latn-GB', { resolve: false });
  m = matcher.match('en-AU');
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('en-Latn-GB');

  // A Locale instance can be passed in to ensure the locale's id matches the
  // exact input tag form, assuming the language tags have all relevant
  const supported: Locale[] = [
    { id: 'en', tag: new LanguageTag('en', 'Latn', 'US') },
    { id: 'en_GB', tag: new LanguageTag('en', 'Latn', 'GB') },
  ];
  matcher = new LocaleMatcher(supported, { resolve: false });
  m = matcher.match('en-AU');
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('en_GB');
});

test('bad args', () => {
  expect(() => new LocaleMatcher((undefined as unknown) as string)).toThrowError('at least');
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

  m = matcher.match('pt');
  expect(m.distance).toEqual(4);

  // Parsing will correct the subtag separator
  matcher = new LocaleMatcher([parseLanguageTag('en_GB'), parseLanguageTag('pt_AR')]);
  m = matcher.match('en-AU');
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('en-GB');

  // Only substitute aliases
  matcher = new LocaleMatcher([parseLanguageTag('eng-Latn-US'), parseLanguageTag('eng-Latn-GB')]);
  m = matcher.match('en-AU');
  expect(m.distance).toEqual(3);
  expect(m.locale.id).toEqual('eng-Latn-GB');

  // Invalid args
  matcher = new LocaleMatcher(['en', (new Date() as unknown) as LanguageTag]);
  m = matcher.match('de');
  expect(m.distance).toEqual(100);
  expect(m.locale.id).toEqual('en');

  // Aliases will be substituted automatically
  matcher = new LocaleMatcher([{ id: 'en', tag: parseLanguageTag('eng-Latn-US') }]);
  m = matcher.match('en');
  expect(m.locale.tag.expanded()).toEqual('en-Latn-US');

  // Disable alias substitution
  matcher = new LocaleMatcher([{ id: 'en', tag: parseLanguageTag('eng-Latn-US') }], { resolve: false });
  m = matcher.match('en');
  expect(m.locale.tag.expanded()).toEqual('eng-Latn-US');
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

loadMatchCases().forEach((c) => {
  test(`locale-match-cases.txt - line ${c.lineno}`, () => {
    const m = new LocaleMatcher(c.supported);
    const result = m.match(c.desired);
    expect(result.locale.id).toEqual(c.result);
  });
});

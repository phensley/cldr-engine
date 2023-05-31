import {
  BuddhistDate,
  CalendarDate,
  Decimal,
  DecimalConstants,
  DefaultMessageArgConverter,
  GregorianDate,
  ISO8601Date,
  JapaneseDate,
  LanguageTag,
  LocaleMatcher,
  PersianDate,
  Rational,
  buildMessageMatcher,
  parseMessagePattern,
  pluralRules,
} from '../src';

// These tests are simply to ensure that all top-level exported symbols are present and functional.

test('message matcher', () => {
  const matcher = buildMessageMatcher(['foo', 'bar'], true);
  const pattern = parseMessagePattern('a {0} b', matcher);
  expect(pattern).toEqual([
    4,
    [
      [0, 'a '],
      [1, 0],
      [0, ' b'],
    ],
  ]);
});

test('plural rules', () => {
  const rules = pluralRules.get('en', 'US');

  expect(rules.cardinal(DecimalConstants.ONE)).toEqual('one');
  expect(rules.cardinal(new Decimal('5'))).toEqual('other');
});

test('dates', () => {
  const zoneId = 'America/Los_Angeles';
  const epoch = 1520751625000;
  const buddhist: CalendarDate = BuddhistDate.fromUnixEpoch(epoch, zoneId, 0, 0);
  expect(buddhist.year()).toEqual(2561);

  const gregorian: CalendarDate = GregorianDate.fromUnixEpoch(epoch, zoneId, 0, 0);
  expect(gregorian.year()).toEqual(2018);
  expect(gregorian.type()).toEqual('gregory');

  const japanese: CalendarDate = JapaneseDate.fromUnixEpoch(epoch, zoneId, 0, 0);
  expect(japanese.year()).toEqual(30);

  const persian: PersianDate = PersianDate.fromUnixEpoch(epoch, zoneId, 0, 0);
  expect(persian.year()).toEqual(1396);

  const iso: CalendarDate = ISO8601Date.fromUnixEpoch(epoch, zoneId, 0, 0);
  expect(iso.year()).toEqual(2018);
});

test('rational', () => {
  const r = new Rational('1/5');
  expect(r.toDecimal().toString()).toEqual('0.2');
});

// test('message arg converter', () => {});

test('language tag', () => {
  const tag = new LanguageTag('en', undefined, 'US');
  expect(tag.language()).toEqual('en');
  expect(tag.script()).toEqual('Zzzz');
  expect(tag.region()).toEqual('US');
});

test('locale matcher', () => {
  const matcher = new LocaleMatcher('en, fr-CA');
  expect(matcher.match('fr').locale.id).toEqual('fr-CA');
});

test('messages', () => {
  const converter = new DefaultMessageArgConverter();
  expect(converter.asDecimal('1.23')).toEqual(new Decimal('1.23'));
});

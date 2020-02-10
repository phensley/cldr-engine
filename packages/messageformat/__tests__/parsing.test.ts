import {
  parseMessagePattern,
  stickyRegexp,
  MessageCode,
  MessageOpType,
  PluralChoiceType,
  PluralNumberType,
  StickyMatcher,
} from '../src';

const NAMES = ['decimal', 'number'];

const matcher = () => new StickyMatcher(NAMES, stickyRegexp);

const parse = (s: string) => parseMessagePattern(s, matcher());

test('basic', () => {
  let c: MessageCode;

  c = parse('{name} {height , select , tall {is tall} short {is short} mid {is of average height}}');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.ARG, 'name'],
    [MessageOpType.TEXT, ' '],
    [MessageOpType.SELECT, ['height'], [
      ['tall', [MessageOpType.TEXT, 'is tall']],
      ['short', [MessageOpType.TEXT, 'is short']],
      ['mid', [MessageOpType.TEXT, 'is of average height']]
    ]]
  ]]);

  c = parse('{0, plural, =0 {is zero} =53 {is fifty-three} one {is one} other {is other}}');
  expect(c).toEqual([MessageOpType.PLURAL, [0], 0, 0, [
    [PluralChoiceType.EXACT, '0', [MessageOpType.TEXT, 'is zero']],
    [PluralChoiceType.EXACT, '53', [MessageOpType.TEXT, 'is fifty-three']],
    [PluralChoiceType.CATEGORY, 'one', [MessageOpType.TEXT, 'is one']],
    [PluralChoiceType.CATEGORY, 'other', [MessageOpType.TEXT, 'is other']]
  ]]);

  c = parse('{0, decimal, percent}');
  expect(c).toEqual([MessageOpType.SIMPLE, 'decimal', [0], ['percent']]);

  c = parse('{0, number, percent}');
  expect(c).toEqual([MessageOpType.SIMPLE, 'number', [0], ['percent']]);

  c = parse('{0, foobar, percent}');
  expect(c).toEqual([MessageOpType.NOOP]);

  c = parse('A {0, foobar, percent} B');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, 'A '],
    [MessageOpType.TEXT, ' B']
  ]]);

  c = parse('A {0, select, other {1 foobar baz}} B');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, 'A '],
    [MessageOpType.SELECT, [0], [
      ['other', [MessageOpType.TEXT, '1 foobar baz']]
    ]],
    [MessageOpType.TEXT, ' B']
  ]]);

  c = parse('A {0 select foo {1 plural one{}}} B');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, 'A '],
    [MessageOpType.SELECT, [0], [
      ['foo', [MessageOpType.TEXT, '1 plural one']]
    ]],
    [MessageOpType.TEXT, ' B']
  ]]);

  // Nested instructions need an extra '{' '}' level
  c = parse('A {0 select foo {{1 plural offset:1 one{}}}} B');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, 'A '],
    [MessageOpType.SELECT, [0], [
      ['foo', [MessageOpType.PLURAL, [1], 1, PluralNumberType.CARDINAL, [
        [PluralChoiceType.CATEGORY, 'one', [MessageOpType.NOOP]]
      ]],
      ]]],
    [MessageOpType.TEXT, ' B']
  ]]);

});

test('unclosed', () => {
  let c: MessageCode;

  c = parse('hello {0 plural one');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, 'hello '],
    [MessageOpType.TEXT, '{0 plural one']
  ]]);

  c = parse('{');
  expect(c).toEqual([MessageOpType.TEXT, '{']);
});

test('escapes', () => {
  let c: MessageCode;

  // '{' '}' wrapped text in the outermost scope that is not a valid tag
  // is dropped.
  c = parse("'{' 0 plural one {foo bar} '}'");
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, '{ 0 plural one '],
    [MessageOpType.TEXT, ' }']
  ]]);

  c = parse("'{'0 plural one {1 select baz {hi there}} '}'");
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, '{0 plural one '],
    [MessageOpType.SELECT, [1], [
      ['baz', [MessageOpType.TEXT, 'hi there']]
    ]],
    [MessageOpType.TEXT, ' }']
  ]]);
});

test('arg substitution', () => {
  let c: MessageCode;

  c = parse('# {0 plural one {# = # item} few {#} other {# items}} #');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, '# '],
    [MessageOpType.PLURAL, [0], 0, PluralNumberType.CARDINAL, [
      [PluralChoiceType.CATEGORY, 'one', [MessageOpType.BLOCK, [
        [MessageOpType.ARGSUB],
        [MessageOpType.TEXT, ' = '],
        [MessageOpType.ARGSUB],
        [MessageOpType.TEXT, ' item']
      ]]
      ],
      [PluralChoiceType.CATEGORY, 'few', [MessageOpType.ARGSUB]],
      [PluralChoiceType.CATEGORY, 'other', [MessageOpType.BLOCK, [
        [MessageOpType.ARGSUB],
        [MessageOpType.TEXT, ' items']
      ]]]
    ]],
    [MessageOpType.TEXT, ' #']
  ]]);
});

test('hidden', () => {
  let c: MessageCode;

  c = parse('# {0 plural one {-# = # item} few {-#} other {-# items}} #');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, '# '],
    [MessageOpType.PLURAL, [0], 0, PluralNumberType.CARDINAL, [
      [PluralChoiceType.CATEGORY, 'one', [MessageOpType.TEXT, '{# = # item}']],
      [PluralChoiceType.CATEGORY, 'few', [MessageOpType.TEXT, '{#}']],
      [PluralChoiceType.CATEGORY, 'other', [MessageOpType.TEXT, '{# items}']]
    ]],
    [MessageOpType.TEXT, ' #']
  ]]);
});

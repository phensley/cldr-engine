import { Decimal, DecimalConstants } from '@phensley/decimal';
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

const matcher = (s: string) => new StickyMatcher(s, NAMES, stickyRegexp);

const parse = (s: string) => parseMessagePattern(s, matcher(s));

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
    [PluralChoiceType.EXACT, DecimalConstants.ZERO, [MessageOpType.TEXT, 'is zero']],
    [PluralChoiceType.EXACT, new Decimal(53), [MessageOpType.TEXT, 'is fifty-three']],
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
});

test('unclosed', () => {
  let c: MessageCode;

  c = parse('hello {0 plural one');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, 'hello '],
    [MessageOpType.TEXT, '{0 plural one']
  ]]);
});

test('escapes', () => {
  let c: MessageCode;

  // '{' '}' wrapped text in the outermost scope that is not a valid tag
  // is dropped.
  c = parse("'{' 0 plural one {foo bar} '}'");
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, '{'],
    [MessageOpType.TEXT, ' 0 plural one '],
    [MessageOpType.TEXT, ' }']
  ]]);

  c = parse("'{'0 plural one {1 select baz {hi there}} '}'");
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, '{'],
    [MessageOpType.TEXT, '0 plural one '],
    [MessageOpType.SELECT, [1], [
      ['baz', [MessageOpType.TEXT, 'hi there']]
    ]],
    [MessageOpType.TEXT, ' }']
  ]]);

  c = parse('leader {0 select foo {1 plural}} trailer');
  expect(c).toEqual([MessageOpType.BLOCK, [
    [MessageOpType.TEXT, 'leader '],
    [MessageOpType.SELECT, [0], [
      ['foo', [MessageOpType.TEXT, '1 plural']]
    ]],
    [MessageOpType.TEXT, ' trailer']
  ]]);
});

test('arg substitution', () => {
  let c: MessageCode;

  c = parse('{0 plural one {# = # item} few {#} other {# items}}');
  expect(c).toEqual([MessageOpType.PLURAL, [0], 0, PluralNumberType.CARDINAL, [
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
  ]]);
});
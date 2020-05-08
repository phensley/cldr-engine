import {
  parseMessagePattern,
  stickyRegexp,
  MessageArg,
  MessageCode,
  MessageEngine,
  MessageNamedArgs,
  StickyMatcher,
} from '../src';
import { pluralRules } from '@phensley/plurals';
import { DefaultMessageArgConverter } from '../src/evaluation/converter';

const CUSTOM = {
  foo: (args: MessageArg[], _options: string[]) => `foo args ${JSON.stringify(args)}`,
  bar: (_args: MessageArg[], options: string[]) => `bar options ${JSON.stringify(options)}`,
};

const CUSTOM_NAMES = Object.keys(CUSTOM);

const CONVERTER = new DefaultMessageArgConverter();

const matcher = () => new StickyMatcher(CUSTOM_NAMES, stickyRegexp);

const parse = (s: string) => parseMessagePattern(s, matcher());

const evaluate = (lang: string, code: MessageCode, positional: MessageArg[], named?: MessageNamedArgs) => {
  const plurals = pluralRules.get(lang);
  return new MessageEngine(plurals, CONVERTER, CUSTOM, code).evaluate(positional, named);
};

test('basic message evaluation', () => {
  let c: MessageCode;

  c = parse('{0 plural one {is ONE} other {is OTHER}}');
  expect(evaluate('en', c, [0])).toEqual('is OTHER');
  expect(evaluate('en', c, [1])).toEqual('is ONE');
  expect(evaluate('en', c, [2])).toEqual('is OTHER');
  expect(evaluate('en', c, [5])).toEqual('is OTHER');

  c = parse('{gender, select, female {her bar} male {his foo} they {their baz} other {unknown quux}}');
  expect(evaluate('en', c, [], { gender: 'male' })).toEqual('his foo');
  expect(evaluate('en', c, [], { gender: 'female' })).toEqual('her bar');
  expect(evaluate('en', c, [], { gender: 'they' })).toEqual('their baz');
  expect(evaluate('en', c, [], { gender: 'other' })).toEqual('unknown quux');
  expect(evaluate('en', c, [], { gender: 'zzz' })).toEqual('unknown quux');
});

test('hidden tags', () => {
  let c = parse('{0}{-1}');
  expect(evaluate('en', c, [1, 1])).toEqual('1{1}');
  expect(evaluate('en', c, [2, 2])).toEqual('2{1}');

  c = parse('{0 plural one {-ONE #} other {OTHER #}}');
  expect(evaluate('en', c, [1])).toEqual('{ONE #}');
  expect(evaluate('en', c, [2])).toEqual('OTHER 2');
  expect(evaluate('en', c, [15])).toEqual('OTHER 15');

  c = parse('{0}{-0 missing formatter}{1}');
  expect(evaluate('en', c, [1, 2])).toEqual('1{0 missing formatter}2');

  c = parse('{0}{a}{-0}{-a}{}{-}{--}{---}');
  expect(evaluate('en', c, [], { a: 'A' })).toEqual('A{0}{a}{}{-}{--}');
});

test('undefined formatter', () => {
  // Parser is given a formatter name that is not defined during evaluation
  const message = '{0 baz}';
  const m = new StickyMatcher(['baz'], stickyRegexp);
  const code = parseMessagePattern(message, m);

  const engine = new MessageEngine(pluralRules.get('en'), CONVERTER, {}, code);
  expect(engine.evaluate([123])).toEqual('');
});

test('plurals', () => {
  let c: MessageCode;

  c = parse(
    '==> {0, plural, offset:1 ' +
      '     =0 {Be the first to like this}' +
      '     =1 {You liked this}' +
      '    one {You and someone else liked this}' +
      '  other {You and # others liked this}' +
      '}!',
  );

  expect(evaluate('en', c, [0])).toEqual('==> Be the first to like this!');
  expect(evaluate('en', c, [1])).toEqual('==> You liked this!');
  expect(evaluate('en', c, [2])).toEqual('==> You and someone else liked this!');
  expect(evaluate('en', c, [3])).toEqual('==> You and 2 others liked this!');
  expect(evaluate('en', c, [4])).toEqual('==> You and 3 others liked this!');

  c = parse('{0 plural =0 {is zero} other {do not know}}');
  expect(evaluate('en', c, [0])).toEqual('is zero');
  expect(evaluate('en', c, [1])).toEqual('do not know');

  c = parse('{0 plural =53{fifty-three} other{dunno}}');
  expect(evaluate('en', c, [53])).toEqual('fifty-three');
  expect(evaluate('en', c, [1])).toEqual('dunno');
  expect(evaluate('en', c, [3])).toEqual('dunno');
});

test('blocks', () => {
  let c: MessageCode;

  c = parse('leader {0 plural =0 {zero items} one {# item} other {# items}} trailer');
  expect(evaluate('en', c, [0])).toEqual('leader zero items trailer');
  expect(evaluate('en', c, [1])).toEqual('leader 1 item trailer');
  expect(evaluate('en', c, [3])).toEqual('leader 3 items trailer');

  c = parse('{name} was {0 selectordinal one{#st} two{#nd} few{#rd} other{#th}}!');
  expect(evaluate('en', c, [1], { name: 'Bob' })).toEqual('Bob was 1st!');
  expect(evaluate('en', c, [2], { name: 'Bob' })).toEqual('Bob was 2nd!');
  expect(evaluate('en', c, [3], { name: 'Bob' })).toEqual('Bob was 3rd!');
  expect(evaluate('en', c, [4], { name: 'Bob' })).toEqual('Bob was 4th!');
  expect(evaluate('en', c, [5], { name: 'Bob' })).toEqual('Bob was 5th!');
});

// { one: 'st', two: 'nd', few: 'rd', other: 'th' }

test('custom formatter args', () => {
  let c: MessageCode;

  c = parse('{0 foo}');
  expect(evaluate('en', c, [0])).toEqual('foo args [0]');
  expect(evaluate('en', c, [new Date(1234567890000)])).toContain('foo args ["2009');
  expect(evaluate('en', c, [{ msg: 'hello' }])).toContain('foo args [{"msg":"hello"}]');

  c = parse('{msg foo}');
  expect(evaluate('en', c, [], { msg: 'hello' })).toContain('foo args ["hello"]');

  c = parse('{missing foo}');
  expect(evaluate('en', c, [], { msg: 'hello' })).toContain('foo args [null]');

  c = parse('{missing;msg foo}');
  expect(evaluate('en', c, [], { msg: 'hello' })).toContain('foo args [null,"hello"]');

  c = parse('{0 quux}');
  expect(evaluate('en', c, [0])).toEqual('');
});

test('custom formatter options', () => {
  let c: MessageCode;

  c = parse('{0;1 bar a b ::c "d"}');
  expect(evaluate('en', c, [0])).toEqual('bar options ["a","b","::c","\\"d\\""]');
});

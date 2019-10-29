import { MessageArgs, MessageEngine } from '../../../src/systems/message';
import { parseMessagePattern, MessageCode, StickyMatcher } from '../../../src/parsing/message';

const matcher = (s: string) => new StickyMatcher(s);

const parse = (s: string) => parseMessagePattern(s, matcher(s));

const evaluate = (lang: string, code: MessageCode, ...args: MessageArgs) =>
  new MessageEngine(lang, code).evaluate(...args);

test('basic message evaluation', () => {
  let code: MessageCode;

  code = parse('{0 plural one {is ONE} other {is OTHER}}');
  expect(evaluate('en', code, 0)).toEqual('is OTHER');
  expect(evaluate('en', code, 1)).toEqual('is ONE');
  expect(evaluate('en', code, 2)).toEqual('is OTHER');
  expect(evaluate('en', code, 5)).toEqual('is OTHER');

  code = parse('{gender, select, female {her bar} male {his foo} they {their baz} other {unknown quux}}');
  expect(evaluate('en', code, { gender: 'male' })).toEqual('his foo');
  expect(evaluate('en', code, { gender: 'female' })).toEqual('her bar');
  expect(evaluate('en', code, { gender: 'they' })).toEqual('their baz');
  expect(evaluate('en', code, { gender: 'other' })).toEqual('unknown quux');
  expect(evaluate('en', code, { gender: 'zzz' })).toEqual('unknown quux');
});

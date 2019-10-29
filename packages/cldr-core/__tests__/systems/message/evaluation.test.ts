import { MessageArgs, MessageEngine } from '../../../src/systems/message';
import { parseMessagePattern, MessageCode, StickyMatcher } from '../../../src/parsing/message';

const matcher = (s: string) => new StickyMatcher(s);

const parse = (s: string) => parseMessagePattern(s, matcher(s));

const evaluate = (lang: string, code: MessageCode, ...args: MessageArgs) =>
  new MessageEngine(lang, code).evaluate(...args);

test('basic message evaluation', () => {
  let code = parse('{0 plural one {is ONE} other {is OTHER}}');
  expect(evaluate('en', code, 0)).toEqual('is OTHER');
  expect(evaluate('en', code, 1)).toEqual('is ONE');
  expect(evaluate('en', code, 2)).toEqual('is OTHER');
  expect(evaluate('en', code, 5)).toEqual('is OTHER');

  code = parse('{gender, select, female {her bar} male {his foo} they {their foo}}');
  expect(evaluate('en', code, { gender: 'male' }));
  expect(evaluate('en', code, { gender: 'female' }));
  expect(evaluate('en', code, { gender: 'they' }));
});

import { parseWrapperPattern } from '../../src/parsing/wrapper';

const parse = parseWrapperPattern;

test('basics', () => {
  expect(parse("{1} 'at' {0}")).toEqual([1, ' at ', 0]);
});

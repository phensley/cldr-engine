import { parseWrapperPattern } from '../../../src/parsing/patterns/wrapper';

const parse = parseWrapperPattern;

test('basics', () => {
  expect(parse("{1} 'at' {0}")).toEqual([
    1, ' at ', 0
  ]);
});

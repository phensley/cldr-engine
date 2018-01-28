import { parse, Arg } from '../../../src/parsing/patterns/wrapper';

const arg = (n: number) => new Arg(n);

test('basics', () => {
  expect(parse("{1} 'at' {0}")).toEqual([
    arg(1), ' at ', arg(0)
  ]);
});

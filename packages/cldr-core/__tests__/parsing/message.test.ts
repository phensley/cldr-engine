import { parseMessagePattern, MessageCode, MessageOpType, StickyMatcher } from '../../src/parsing/message';

const matcher = (s: string) => new StickyMatcher(s);

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

  c = parse('{0, decimal, percent}');
  expect(c).toEqual([MessageOpType.DECIMAL, [0], 'percent']);

  c = parse('{0, number, percent}');
  expect(c).toEqual([MessageOpType.DECIMAL, [0], 'percent']);
});

import { parseMessagePattern, MessageNode, MessageNodeType, StickyMatcher } from '../../src/parsing/message';

const matcher = (s: string) => new StickyMatcher(s);

const parse = (s: string) => parseMessagePattern(s, matcher(s));

test('basic', () => {
  let c: MessageNode;

  c = parse('{name} {height , select , tall {is tall} short {is short} mid {is of average height}}');
  expect(c).toEqual([MessageNodeType.BLOCK, [
    [MessageNodeType.ARG, 'name'],
    [MessageNodeType.TEXT, ' '],
    [MessageNodeType.SELECT, 'height', [
      ['tall', [MessageNodeType.TEXT, 'is tall']],
      ['short', [MessageNodeType.TEXT, 'is short']],
      ['mid', [MessageNodeType.TEXT, 'is of average height']]
    ]]
  ]]);
});

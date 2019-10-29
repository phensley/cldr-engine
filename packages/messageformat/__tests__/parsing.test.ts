import {
  parseMessagePattern,
  MessageCode,
  MessageOpType,
  PluralChoiceType,
  StickyMatcher,
} from '../src/parser';
import { DecimalConstants } from '@phensley/decimal';

const NAMES = ['decimal', 'number'];

const matcher = (s: string) => new StickyMatcher(s, NAMES);

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

  c = parse('{0, plural, =0 {is zero} one {is one} other {is other}}');
  expect(c).toEqual([MessageOpType.PLURAL, [0], 0, 0, [
    [PluralChoiceType.EXACT, DecimalConstants.ZERO, [MessageOpType.TEXT, 'is zero']],
    [PluralChoiceType.CATEGORY, 'one', [MessageOpType.TEXT, 'is one']],
    [PluralChoiceType.CATEGORY, 'other', [MessageOpType.TEXT, 'is other']]
  ]
  ]);

  c = parse('{0, decimal, percent}');
  expect(c).toEqual([MessageOpType.SIMPLE, 'decimal', [0], ['percent']]);

  c = parse('{0, number, percent}');
  expect(c).toEqual([MessageOpType.SIMPLE, 'number', [0], ['percent']]);
});

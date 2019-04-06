import { Part } from '@phensley/decimal';
import { WrapperInternalsImpl } from '../../../src';

const wrapper = new WrapperInternalsImpl();

test('wrapper args', () => {
  let s = wrapper.format('{0} {1}', ['a', 'b']);
  expect(s).toEqual('a b');

  s = wrapper.format('{0} {1}', ['a', 'b', 'c', 'd']);
  expect(s).toEqual('a b');

  s = wrapper.format('{0} {1} {2} {3}', ['a', 'b', 'c', 'd']);
  expect(s).toEqual('a b c d');

  s = wrapper.format('{0} {1} {2} {3}', ['a', '', 'c']);
  expect(s).toEqual('a  c ');
});

test('parts', () => {
  const parts: Part[][] = [
    [{ type: 'char', value: 'a' }],
    [{ type: 'char', value: 'b' }],
    [{ type: 'char', value: 'c' }],
    [{ type: 'char', value: 'd' }]
  ];

  let p = wrapper.formatParts('{0} {1}', parts);
  expect(p).toEqual([
    { type: 'char', value: 'a' },
    { type: 'literal', value: ' ' },
    { type: 'char', value: 'b' }
  ]);

  p = wrapper.formatParts('{0} {1} {2} {3}', parts);
  expect(p).toEqual([
    { type: 'char', value: 'a' },
    { type: 'literal', value: ' ' },
    { type: 'char', value: 'b' },
    { type: 'literal', value: ' ' },
    { type: 'char', value: 'c' },
    { type: 'literal', value: ' ' },
    { type: 'char', value: 'd' }
  ]);

  const parts2: Part[][] = [
    [{ type: 'char', value: 'a' }],
    [{ type: 'char', value: 'b' }],
    [{ type: 'char', value: 'c' }]
  ];
  delete parts2[1];

  p = wrapper.formatParts('{0} {1} {2}', parts2);
  expect(p).toEqual([
    { type: 'char', value: 'a' },
    { type: 'literal', value: ' ' },
    { type: 'literal', value: ' ' },
    { type: 'char', value: 'c' }
  ]);
});

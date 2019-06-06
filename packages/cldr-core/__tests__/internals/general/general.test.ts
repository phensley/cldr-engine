import { INTERNALS } from '../../_helpers';
import { GeneralInternalsImpl } from '../../../src';

const GENERAL = new GeneralInternalsImpl(INTERNALS());

test('wrapper args', () => {
  let s = GENERAL.formatWrapper('{0} {1}', ['a', 'b']);
  expect(s).toEqual('a b');

  s = GENERAL.formatWrapper('{0} {1}', ['a', 'b', 'c', 'd']);
  expect(s).toEqual('a b');

  s = GENERAL.formatWrapper('{0} {1} {2} {3}', ['a', 'b', 'c', 'd']);
  expect(s).toEqual('a b c d');

  s = GENERAL.formatWrapper('{0} {1} {2} {3}', ['a', '', 'c']);
  expect(s).toEqual('a  c ');
});

// Parts formatting is currently done via a Renderer.
// test('parts', () => {
//   const parts: Part[][] = [
//     [{ type: 'char', value: 'a' }],
//     [{ type: 'char', value: 'b' }],
//     [{ type: 'char', value: 'c' }],
//     [{ type: 'char', value: 'd' }]
//   ];

//   let p = wrapper.formatParts('{0} {1}', parts);
//   expect(p).toEqual([
//     { type: 'char', value: 'a' },
//     { type: 'literal', value: ' ' },
//     { type: 'char', value: 'b' }
//   ]);

//   p = wrapper.formatParts('{0} {1} {2} {3}', parts);
//   expect(p).toEqual([
//     { type: 'char', value: 'a' },
//     { type: 'literal', value: ' ' },
//     { type: 'char', value: 'b' },
//     { type: 'literal', value: ' ' },
//     { type: 'char', value: 'c' },
//     { type: 'literal', value: ' ' },
//     { type: 'char', value: 'd' }
//   ]);

//   const parts2: Part[][] = [
//     [{ type: 'char', value: 'a' }],
//     [{ type: 'char', value: 'b' }],
//     [{ type: 'char', value: 'c' }]
//   ];
//   delete parts2[1];

//   p = wrapper.formatParts('{0} {1} {2}', parts2);
//   expect(p).toEqual([
//     { type: 'char', value: 'a' },
//     { type: 'literal', value: ' ' },
//     { type: 'literal', value: ' ' },
//     { type: 'char', value: 'c' }
//   ]);
// });

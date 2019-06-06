import { languageBundle, INTERNALS } from '../../_helpers';
import { GeneralInternalsImpl } from '../../../src';
import { ContextTransformInfo } from '../../../src/common/private';

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

test('context transform', () => {
  let s: string;
  const yes = {'calendar-field': 'TN'} as ContextTransformInfo;
  const no = {} as ContextTransformInfo;
  const field = 'calendar-field';

  s = GENERAL.contextTransform('', yes, 'standalone', field);
  expect(s).toEqual('');

  s = GENERAL.contextTransform('', yes, 'ui-list-or-menu', field);
  expect(s).toEqual('');

  s = GENERAL.contextTransform('abc', yes, 'standalone', field);
  expect(s).toEqual('Abc');

  s = GENERAL.contextTransform('abc', yes, 'ui-list-or-menu', field);
  expect(s).toEqual('abc');

  s = GENERAL.contextTransform('abc', no, 'standalone', field);
  expect(s).toEqual('abc');

  s = GENERAL.contextTransform('abc', no, 'ui-list-or-menu', field);
  expect(s).toEqual('abc');
});

test('region names', () => {
  let s: string;
  const en = languageBundle('en');

  s = GENERAL.getRegionDisplayName(en, 'US');
  expect(s).toEqual('United States');

  s = GENERAL.getRegionDisplayName(en, 'US', 'short');
  expect(s).toEqual('US');

  s = GENERAL.getRegionDisplayName(en, 'GB');
  expect(s).toEqual('United Kingdom');

  s = GENERAL.getRegionDisplayName(en, 'GB', 'short');
  expect(s).toEqual('UK');

  s = GENERAL.getRegionDisplayName(en, 'FR');
  expect(s).toEqual('France');

  s = GENERAL.getRegionDisplayName(en, 'FR', 'short');
  expect(s).toEqual('France');
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

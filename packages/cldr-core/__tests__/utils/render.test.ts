import { PartsRenderer, Renderer, StringRenderer } from '../../src/utils/render';
import { parseWrapperPattern } from '../../src/parsing/patterns/wrapper';

test('string', () => {
  const r = new StringRenderer();
  r.literal('A');
  r.literal('B');
  r.add('foo', 'C');
  r.append('D');
  expect(r.get()).toEqual('ABCD');
  expect(r.get()).toEqual('');
  expect(r.empty()).toEqual('');
  expect(r.join('A', 'B', 'C')).toEqual('ABC');

  const p = parseWrapperPattern('{3}, {1} - {0}, {2}');
  r.wrap(p, ['A', 'B', 'C', 'D', 'E', 'F']);
  expect(r.get()).toEqual('D, B - A, C');
});

test('parts', () => {
  const r = new PartsRenderer();
  r.literal('A');
  r.literal('B');
  r.add('foo', 'C');
  r.append([{ type: 'bar', value: 'D' }]);
  expect(r.get()).toEqual([
    { type: 'literal', value: 'A' },
    { type: 'literal', value: 'B' },
    { type: 'foo', value: 'C' },
    { type: 'bar', value: 'D' }
  ]);

  expect(r.get()).toEqual([]);
  expect(r.empty()).toEqual([]);
  expect(r.join([
    { type: 'foo', value: 'A' },
    { type: 'bar', value: 'B' },
    { type: 'baz', value: 'C' }
  ])).toEqual([
    { type: 'foo', value: 'A' },
    { type: 'bar', value: 'B' },
    { type: 'baz', value: 'C' }
  ]);

  const p = parseWrapperPattern('{3}, {1} - {0}, {2}');
  r.wrap(p, [
    [{ type: 'aaa', value: 'A' }],
    [{ type: 'bbb', value: 'B' }],
    [{ type: 'ccc', value: 'C' }],
    [{ type: 'ddd', value: 'D' }],
    [{ type: 'eee', value: 'E' }],
    [{ type: 'fff', value: 'F' }]
  ]);
  expect(r.get()).toEqual([
    { type: 'ddd', value: 'D' },
    { type: 'literal', value: ', ' },
    { type: 'bbb', value: 'B' },
    { type: 'literal', value: ' - ' },
    { type: 'aaa', value: 'A' },
    { type: 'literal', value: ', ' },
    { type: 'ccc', value: 'C' }
  ]);
});

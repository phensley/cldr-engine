import { AbstractValue, PartsValue, StringValue } from '../../src/utils/render';
import { parseWrapperPattern } from '../../src/parsing/patterns/wrapper';

test('string', () => {
  const v = new StringValue();
  v.add('literal', 'A');
  v.add('literal', 'B');
  v.add('foo', 'C');
  v.append('D');
  expect(v.render()).toEqual('ABCD');
  expect(v.render()).toEqual('');
  expect(v.empty()).toEqual('');
  expect(v.join('A', 'B', 'C')).toEqual('ABC');

  const p = parseWrapperPattern('{3}, {1} - {0}, {2}');
  v.wrap(p, ['A', 'B', 'C', 'D', 'E', 'F']);
  expect(v.render()).toEqual('D, B - A, C');
});

test('parts', () => {
  const v = new PartsValue();
  v.add('literal', 'A');
  v.add('literal', 'B');
  v.add('foo', 'C');
  v.append([{ type: 'bar', value: 'D' }]);
  expect(v.render()).toEqual([
    { type: 'literal', value: 'A' },
    { type: 'literal', value: 'B' },
    { type: 'foo', value: 'C' },
    { type: 'bar', value: 'D' }
  ]);

  expect(v.render()).toEqual([]);
  expect(v.empty()).toEqual([]);
  expect(v.join([
    { type: 'foo', value: 'A' },
    { type: 'bar', value: 'B' },
    { type: 'baz', value: 'C' }
  ])).toEqual([
    { type: 'foo', value: 'A' },
    { type: 'bar', value: 'B' },
    { type: 'baz', value: 'C' }
  ]);

  const p = parseWrapperPattern('{3}, {1} - {0}, {2}');
  v.wrap(p, [
    [{ type: 'aaa', value: 'A' }],
    [{ type: 'bbb', value: 'B' }],
    [{ type: 'ccc', value: 'C' }],
    [{ type: 'ddd', value: 'D' }],
    [{ type: 'eee', value: 'E' }],
    [{ type: 'fff', value: 'F' }]
  ]);
  expect(v.render()).toEqual([
    { type: 'ddd', value: 'D' },
    { type: 'literal', value: ', ' },
    { type: 'bbb', value: 'B' },
    { type: 'literal', value: ' - ' },
    { type: 'aaa', value: 'A' },
    { type: 'literal', value: ', ' },
    { type: 'ccc', value: 'C' }
  ]);
});

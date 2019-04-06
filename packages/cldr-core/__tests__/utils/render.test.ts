import { PartsValue, StringValue } from '../../src/utils/render';
import { parseWrapperPattern } from '../../src/parsing/wrapper';

test('string', () => {
  const v = new StringValue();
  v.add('literal', 'A');
  v.add('literal', 'B');
  v.add('foo', 'C');
  v.append('D');
  expect(v.render()).toEqual('ABCD');

  v.add('literal', 'A');
  v.reset();
  expect(v.render()).toEqual('');

  expect(v.render()).toEqual('');
  expect(v.empty()).toEqual('');
  expect(v.join('A', 'B', 'C')).toEqual('ABC');

  let p = parseWrapperPattern('{3}, {1} - {0}, {2}');
  v.wrap(p, ['A', 'B', 'C', 'D', 'E', 'F']);
  expect(v.render()).toEqual('D, B - A, C');

  v.reset();
  expect(v.render()).toEqual('');

  v.add('foo', 'A');
  expect(v.get(0)).toEqual('A');
  expect(v.get(1)).toEqual('');

  v.reset();
  p = parseWrapperPattern('{0} {1} {2}');
  v.wrap(p, ['A']);
  expect(v.render()).toEqual('A  ');
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

  v.add('literal', 'A');
  v.reset();
  expect(v.render()).toEqual([]);

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

  let p = parseWrapperPattern('{3}, {1} - {0}, {2}');
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

  v.add('foo', 'A');
  expect(v.get(0)).toEqual('A');
  expect(v.get(1)).toEqual('');

  v.reset();
  p = parseWrapperPattern('{0} {1} {2}');
  v.wrap(p, [[{ type: 'foo', value: 'A' }]]);
  expect(v.render()).toEqual([
    { type: 'foo', value: 'A' },
    { type: 'literal', value: ' ' },
    { type: 'literal', value: ' ' }
  ]);
});

import { UnitFactors } from '../src';

test('duplicate factors', () => {
  const factors = new UnitFactors([
    ['foo', '2', 'bar'],
    ['foo', '2', 'bar'],
  ]);
  const conv = factors.get('foo', 'bar')!;
  expect(conv.path).toEqual(['foo', 'bar']);
});

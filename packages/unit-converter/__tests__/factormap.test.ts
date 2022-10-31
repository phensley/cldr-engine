import { UnitType } from '@phensley/cldr-types';
import { UnitFactors } from '../src';

test('duplicate factors', () => {
  const factors = new UnitFactors([
    ['foo' as UnitType, '2', 'bar' as UnitType],
    ['foo' as UnitType, '2', 'bar' as UnitType],
  ]);
  const conv = factors.get('foo', 'bar')!;
  expect(conv.path).toEqual(['foo', 'bar']);
});

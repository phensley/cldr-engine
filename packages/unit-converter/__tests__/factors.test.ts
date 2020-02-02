import { Rational } from '@phensley/decimal';
import { ANGLE, AREA, FactorDef, UnitFactors } from '../src';

test('factors', () => {
  const factors: FactorDef[] = [
    ['g-force', '9.80665', 'meter-per-second-squared']
  ];
  const map = new UnitFactors(factors);
  let factor: Rational;

  factor = map.get('g-force', 'meter-per-second-squared')!;
  expect(factor.toString()).toEqual('9.80665 / 1');

  factor = map.get('meter-per-second-squared', 'g-force')!;
  expect(factor.toString()).toEqual('1 / 9.80665');
});

test('angle', () => {
  const map = new UnitFactors(ANGLE);
  let factor: Rational;

  factor = map.get('arc-second', 'arc-minute')!;
  expect(factor.toString()).toEqual('1 / 60');

  factor = map.get('arc-minute', 'arc-second')!;
  expect(factor.toString()).toEqual('60 / 1');

  factor = map.get('arc-second', 'degree')!;
  expect(factor.toString()).toEqual('1 / 3600');

  factor = map.get('degree', 'arc-second')!;
  expect(factor.toString()).toEqual('3600 / 1');
});

test('area', () => {
  const map = new UnitFactors(AREA);
  let factor: Rational;

  factor = map.get('acre', 'square-foot')!;
  expect(factor.toString()).toEqual('43560 / 1');

  factor = map.get('acre', 'square-inch')!;
  expect(factor.toString()).toEqual('6272640 / 1');

  factor = map.get('square-inch', 'acre')!;
  expect(factor.toString()).toEqual('1 / 6272640');
});

import { Rational } from '@phensley/decimal';
import { ANGLE, AREA, FactorDef, UnitConversion, UnitFactors } from '../src';

test('factors', () => {
  const factors: FactorDef[] = [
    ['g-force', '9.80665', 'meter-per-second-squared']
  ];
  const map = new UnitFactors(factors);
  let c: UnitConversion;

  const f = (e: UnitConversion) => e.factors.map(x => x.toString());

  c = map.get('g-force', 'meter-per-second-squared')!;
  expect(f(c)).toEqual(['9.80665 / 1']);

  c = map.get('meter-per-second-squared', 'g-force')!;
  expect(f(c)).toEqual(['1 / 9.80665']);
});

test('angle', () => {
  const map = new UnitFactors(ANGLE);
  let c: UnitConversion;

  const f = (e: UnitConversion) => e.factors.map(x => x.toString());

  c = map.get('arc-second', 'arc-minute')!;
  expect(f(c)).toEqual(['1 / 60']);

  c = map.get('arc-minute', 'arc-second')!;
  expect(f(c)).toEqual(['60 / 1']);

  c = map.get('arc-second', 'degree')!;
  expect(f(c)).toEqual(['1 / 60', '1 / 60']);

  c = map.get('degree', 'arc-second')!;
  expect(f(c)).toEqual(['60 / 1', '60 / 1']);
});

test('area', () => {
  const map = new UnitFactors(AREA);
  let c: UnitConversion;

  const f = (e: UnitConversion) => e.factors.map(x => x.toString());

  c = map.get('acre', 'square-foot')!;
  expect(f(c)).toEqual(['43560 / 1']);

  c = map.get('acre', 'square-inch')!;
  expect(f(c)).toEqual(['43560 / 1', '144 / 1']);

  c = map.get('square-inch', 'acre')!;
  expect(f(c)).toEqual(['1 / 144', '1 / 43560']);

  // Caching coverage
  c = map.get('acre', 'square-foot')!;
  expect(f(c)).toEqual(['43560 / 1']);

  c = map.get('acre', 'square-foot')!;
  expect(f(c)).toEqual(['43560 / 1']);
});

test('rational factors', () => {
  let c: UnitConversion;
  const map = new UnitFactors([
    ['foo', new Rational('2 / 1'), 'bar']
  ]);

  c = map.get('foo', 'bar')!;
  expect(c.path).toEqual(['foo', 'bar']);
  expect(c.factors.length).toEqual(1);
  expect(c.factors[0].toString()).toEqual('2 / 1');
});

import { UnitType } from '@phensley/cldr-types';
import { Decimal, Rational } from '@phensley/decimal';
import { ANGLE, AREA, DURATION, FactorDef, UnitConversion, UnitConverter, UnitFactors } from '../src';

test('factors', () => {
  const factors: FactorDef[] = [['g-force', '9.80665', 'meter-per-square-second']];
  const map = new UnitFactors(factors);
  let c: UnitConversion;

  const f = (e: UnitConversion) => e.factors.map((x) => x.toString());

  c = map.get('g-force', 'meter-per-square-second')!;
  expect(f(c)).toEqual(['9.80665 / 1']);

  c = map.get('meter-per-square-second', 'g-force')!;
  expect(f(c)).toEqual(['1 / 9.80665']);
});

test('angle', () => {
  const map = new UnitFactors(ANGLE);
  let c: UnitConversion;

  const f = (e: UnitConversion) => e.factors.map((x) => x.toString());

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

  const f = (e: UnitConversion) => e.factors.map((x) => x.toString());

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
  const map = new UnitFactors([['foo' as UnitType, new Rational('2 / 1'), 'bar' as UnitType]]);

  c = map.get('foo', 'bar')!;
  expect(c.path).toEqual(['foo', 'bar']);
  expect(c.factors.length).toEqual(1);
  expect(c.factors[0].toString()).toEqual('2 / 1');
});

test('duration century is 100 years (CLDR 48.2.0 convertUnits: century = 100 year)', () => {
  const map = new UnitFactors(DURATION);
  const c = map.get('century', 'year')!;
  const fac = c.factors.reduce((p, x) => p.multiply(x), new Rational(1));
  expect(fac.compare('100 / 1')).toEqual(0);

  const conv = new UnitConverter();
  conv.add('duration', new UnitFactors(DURATION));
  expect(conv.convert('duration', new Decimal(1), 'century', 'second')!.toString()).toEqual('3155695200');
  expect(conv.convert('duration', new Decimal(1), 'century', 'year')!.toString()).toEqual('100');
  expect(conv.convert('duration', new Decimal(1), 'year', 'second')!.toString()).toEqual('31556952');
});

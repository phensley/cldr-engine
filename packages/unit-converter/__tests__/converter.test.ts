import { UnitConversion, UnitConverter, UnitFactors } from '../src';
import { ACCELERATION, ANGLE, LENGTH } from '../src';
import { Decimal } from '@phensley/decimal';

test('converter', () => {
  const c = new UnitConverter();
  let f: UnitConversion | undefined;
  let v: Decimal | undefined;

  const angle = new UnitFactors(ANGLE);
  c.add('angle', angle);

  expect(c.has('angle')).toBe(true);
  expect(c.has('acceleration')).toBe(false);

  expect(() => c.add('angle', angle)).toThrowError();

  c.add('acceleration', new UnitFactors(ACCELERATION));
  expect(c.has('acceleration')).toBe(true);

  expect(c.factors('angle')).toBe(angle);

  c.add('length', new UnitFactors(LENGTH));
  expect(c.categories()).toEqual(['acceleration', 'angle', 'length']);

  f = c.get('angle', 'revolution', 'arc-minute')!;
  expect(f.path).toEqual(['revolution', 'degree', 'arc-minute']);
  expect(f.factors.map(x => x.toString())).toEqual(['360 / 1', '60 / 1']);

  f = c.get('angle', 'unknown', 'arc-minute');
  expect(f).toBe(undefined);

  f = c.get('unknown', 'arc-second', 'arc-minute');
  expect(f).toBe(undefined);

  v = c.convert('angle', new Decimal(3), 'revolution', 'arc-minute')!;
  expect(v.toString()).toEqual('64800');

  v = c.convert('angle', new Decimal(3), 'revolution', 'unknown');
  expect(v).toBe(undefined);
});

test('constructor', () => {
  const c = new UnitConverter();
  c.add('angle', new UnitFactors(ANGLE));
  c.add('angle-2', new UnitFactors(ANGLE));
  expect(c.has('angle')).toEqual(true);
  expect(c.get('angle', 'degree', 'arc-minute')!.path).toEqual(['degree', 'arc-minute']);
  expect(c.get('angle-2', 'degree', 'arc-minute')!.path).toEqual(['degree', 'arc-minute']);
});

import { Decimal } from '@phensley/decimal';
import { FactorDef, TEMPERATURE, UnitConverter, UnitFactors } from '../src';

const temp = new UnitFactors(TEMPERATURE);

const conv = (src: string, dst: string) => temp.get(src, dst)!;

test('temperature factors are affine', () => {
  // celsius -> kelvin is a direct edge with an offset
  const c = conv('celsius', 'kelvin');
  expect(c.path).toEqual(['celsius', 'kelvin']);
  expect(c.factors.map((x) => x.toString())).toEqual(['1 / 1']);
  expect(c.offset!.toDecimal().toString()).toEqual('273.15');
});

test('temperature compositions are exact', () => {
  // celsius -> fahrenheit = celsius -> kelvin -> fahrenheit: × 9/5 + 32
  const c = conv('celsius', 'fahrenheit');
  expect(c.path).toEqual(['celsius', 'kelvin', 'fahrenheit']);
  expect(c.factors.map((x) => x.toString())).toEqual(['1 / 1', '9 / 5']);
  // The composed offset is the exact rational 32
  expect(c.offset!.compare('32 / 1')).toEqual(0);
});

test('temperature conversions', () => {
  const u = new UnitConverter();
  u.add('temperature', temp);

  const f = (n: number, src: string, dst: string) => u.convert('temperature', new Decimal(n), src, dst)!;

  const eq = (d: Decimal, v: number | string) => expect(d.compare(v)).toEqual(0);

  eq(f(0, 'celsius', 'fahrenheit'), 32);
  eq(f(100, 'celsius', 'fahrenheit'), 212);
  eq(f(-40, 'celsius', 'fahrenheit'), -40);
  eq(f(100, 'celsius', 'kelvin'), 373.15);
  eq(f(0, 'celsius', 'kelvin'), 273.15);
  eq(f(0, 'kelvin', 'celsius'), -273.15);
  eq(f(0, 'rankine', 'kelvin'), 0);
  eq(f(0, 'kelvin', 'rankine'), 0);
  eq(f(300, 'kelvin', 'fahrenheit'), 80.33);

  // Directions involving the repeating 5/9 factor are exact only up to the
  // default decimal precision (28 digits); pin them with a tight tolerance.
  const close = (d: Decimal, v: number) => expect(d.subtract(new Decimal(v)).abs().compare('1e-20')).toBeLessThan(0);
  close(f(491.67, 'rankine', 'kelvin'), 273.15);
  close(f(212, 'fahrenheit', 'celsius'), 100);
  close(f(32, 'fahrenheit', 'celsius'), 0);
});

test('temperature round-trips', () => {
  for (const [a, b] of [
    ['celsius', 'fahrenheit'],
    ['celsius', 'kelvin'],
    ['fahrenheit', 'rankine'],
  ] as const) {
    for (const n of [-100, -40, 0, 1, 25, 100]) {
      const rt = new UnitConverter();
      rt.add('temperature', temp);
      const v = rt.convert('temperature', new Decimal(n), a, b)!;
      const back = rt.convert('temperature', v, b, a)!;
      // Repeating decimals (5/9) are only rendered at finite precision,
      // so allow a 1e-18 absolute tolerance; the exact-pair check below
      // pins celsius/kelvin to zero error.
      expect(back.subtract(new Decimal(n)).abs().compare('1e-18')).toBeLessThan(0);
      if (a === 'celsius' && b === 'kelvin') {
        expect(back.compare(new Decimal(n))).toEqual(0);
      }
    }
  }
});

test('non-temperature conversions have no offset', () => {
  const c = conv('celsius', 'celsius');
  expect(c.offset).toBe(undefined);
  expect(c.factors.map((x) => x.toString())).toEqual(['1 / 1']);
});

test('offset inverts exactly', () => {
  // kelvin -> fahrenheit is the inverse of fahrenheit -> kelvin:
  // F = K × 9/5 − 459.67
  const c = conv('kelvin', 'fahrenheit');
  expect(c.factors.map((x) => x.toString())).toEqual(['9 / 5']);
  expect(c.offset!.toDecimal().toString()).toEqual('-459.67');
});

// Type-level check that the affine FactorDef shape is accepted
test('affine factor definition type', () => {
  const def: FactorDef = ['celsius', '1', 'kelvin', '273.15'];
  const map = new UnitFactors([def]);
  expect(map.get('celsius', 'kelvin')!.offset!.toDecimal().toString()).toEqual('273.15');
});

import { Decimal, RoundingMode } from '../../../src/types/numbers';
import { DivMod, divide } from '../../../src/types/numbers/math';
import { DecimalFormat } from '../../../src/types/numbers/types';

const parse = (s: string) => new Decimal(s);
const parsedata = (s: string) => (new Decimal(s) as any).data;
const cmp = (u: string, v: string, abs: boolean = false) => parse(u).compare(parse(v), abs);
const precision = (u: string) => parse(u).precision();
const scale = (u: string) => parse(u).scale();
const trailZeros = (u: string) => parse(u).trailingZeros();
const shr = (u: string, s: number, m: RoundingMode) => parse(u).shiftright(s, m);

test('parse', () => {
  expect(parse('0')).toEqual({ data: [], exp: 0, sign: 0 });
  expect(parse('1')).toEqual({ data: [1], exp: 0, sign: 1 });
  expect(parse('.1')).toEqual({ data: [1], exp: -1, sign: 1 });
  expect(parse('.000001')).toEqual({ data: [1], exp: -6, sign: 1});
  expect(parse('1.2345')).toEqual({ data: [12345], exp: -4, sign: 1 });
  expect(parse('00001.2')).toEqual({ data: [12], exp: -1, sign: 1 });
  expect(parse('1000000')).toEqual({ data: [1000000], exp: 0, sign: 1 });
  expect(parse('10000000')).toEqual({ data: [0, 1], exp: 0, sign: 1 });
  expect(parse('100000000')).toEqual({ data: [0, 10], exp: 0, sign: 1 });
  expect(parse('1000000000')).toEqual({ data: [0, 100], exp: 0, sign: 1 });

  expect(parse('999999999')).toEqual({ data: [9999999, 99], exp: 0, sign: 1 });
  expect(parse('9999999999')).toEqual({ data: [9999999, 999], exp: 0, sign: 1 });

  expect(parse('+.1')).toEqual({ data: [1], exp: -1, sign: 1 });

  expect(parse('-.1')).toEqual({ data: [1], exp: -1, sign: -1 });
  expect(parse('-10')).toEqual({ data: [10], exp: 0, sign: -1 });

  expect(parse('-10E+5')).toEqual({ data: [10], exp: 5, sign: -1 });
  expect(parse('123.45e99')).toEqual({ data: [12345], exp: 97, sign: 1 });
});

test('parse invalid', () => {
  expect(() => parse('')).toThrowError();
  expect(() => parse('--1')).toThrowError();
  expect(() => parse('1-')).toThrowError();
  expect(() => parse('123..45')).toThrowError();
  expect(() => parse('1.23.45.6')).toThrowError();
  expect(() => parse('12345e')).toThrowError();
  expect(() => parse('e10')).toThrowError();
  expect(() => parse('12345ee1')).toThrowError();
  expect(() => parse('12345E--1')).toThrowError();
  expect(() => parse('12345e10000000000000000')).toThrowError();
  expect(() => parse('123xyz')).toThrowError();
});

test('negate', () => {
  expect(parse('1.12').negate()).toEqual(parse('-1.12'));
  expect(parse('-1.12').negate()).toEqual(parse('1.12'));
  expect(parse('0.00').negate()).toEqual(parse('0.00'));
});

test('is negative', () => {
  expect(parse('1').isNegative()).toEqual(false);
  expect(parse('0').isNegative()).toEqual(false);
  expect(parse('-1').isNegative()).toEqual(true);
});

test('is integer', () => {
  expect(parse('0').isInteger()).toEqual(true);
  expect(parse('0.1').isInteger()).toEqual(false);
  expect(parse('123').isInteger()).toEqual(true);
  expect(parse('.123e3').isInteger()).toEqual(true);
  expect(parse('123.01').isInteger()).toEqual(false);
  expect(parse('123e-3').isInteger()).toEqual(false);

  expect(parse('1').isInteger()).toEqual(true);
  expect(parse('1001').isInteger()).toEqual(true);

  // If decimal is all zeros we count this as an integer since it can
  // be represented as an integer without loss of precision.
  expect(parse('1.0').isInteger()).toEqual(true);
  expect(parse('123.0').isInteger()).toEqual(true);
  expect(parse('1001.0000000000').isInteger()).toEqual(true);

  expect(parse('1.01').isInteger()).toEqual(false);
  expect(parse('1001.00000000001').isInteger()).toEqual(false);
  expect(parse('10e100').isInteger()).toEqual(true);
  expect(parse('10e-100').isInteger()).toEqual(false);
});

test('operands', () => {
  expect(parse('1').operands()).toEqual(
    { n: 1, i: 1, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
  );

  expect(parse('1e-3').operands()).toEqual(
    { n: 0, i: 0, v: 3, w: 3, f: 1, t: 1, neg: false, dec: true }
  );

  expect(parse('1e2').operands()).toEqual(
    { n: 100, i: 100, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
  );

  expect(parse('123.12').operands()).toEqual(
    { n: 123, i: 123, v: 2, w: 2, f: 12, t: 12, neg: false, dec: true }
  );

  expect(parse('-123.400').operands()).toEqual(
    { n: 123, i: 123, v: 3, w: 1, f: 400, t: 4, neg: true, dec: true }
  );

  expect(parse('-1234567890.12300').operands()).toEqual(
    { n: 1234567890, i: 1234567890, v: 5, w: 3, f: 12300, t: 123, neg: true, dec: true }
  );

  expect(parse('0.1234567890123456789').operands()).toEqual(
    { n: 0, i: 0, v: 19, w: 19, f: 12345678901234, t: 12345678901234, neg: false, dec: true }
  );

  expect(parse('1234567890123456789.12345000').operands()).toEqual(
    { n: 7890123456789, i: 7890123456789, v: 8, w: 5, f: 12345000, t: 12345, neg: false, dec: true }
  );
});

test('compare', () => {
  expect(cmp('0', '0')).toEqual(0);
  expect(cmp('1', '1')).toEqual(0);
  expect(cmp('-1', '1')).toEqual(-1);
  expect(cmp('1', '-1')).toEqual(1);
  expect(cmp('-1', '-1')).toEqual(0);
  expect(cmp('2', '1')).toEqual(1);
  expect(cmp('1', '2')).toEqual(-1);

  expect(cmp('12.34', '1.234')).toEqual(1);
  expect(cmp('1.234', '12.34')).toEqual(-1);
  expect(cmp('1.234', '12.34e-1')).toEqual(0);

  expect(cmp('1e10', '1e11')).toEqual(-1);
  expect(cmp('1.23e5', '12e4')).toEqual(1);
  expect(cmp('12e4', '1.23e5')).toEqual(1);
  expect(cmp('-12e4', '1.23e5')).toEqual(-1);
  expect(cmp('-1.23e5', '12e4')).toEqual(-1);
});

test('compare abs', () => {
  expect(cmp('0', '0', true)).toEqual(0);
  expect(cmp('-1', '1', true)).toEqual(0);
  expect(cmp('1', '-1', true)).toEqual(0);
  expect(cmp('-15', '10', true)).toEqual(1);
  expect(cmp('10', '-15', true)).toEqual(-1);
});

test('precision', () => {
  expect(precision('0')).toEqual(1);
  expect(precision('1')).toEqual(1);
  expect(precision('-1')).toEqual(1);
  expect(precision('3.45')).toEqual(3);
  expect(precision('123e10')).toEqual(3);
  expect(precision('1.234')).toEqual(4);
  expect(precision('1000')).toEqual(4);
  expect(precision('10001')).toEqual(5);
  expect(precision('10001.10001')).toEqual(10);

  expect(precision('9')).toEqual(1);
  expect(precision('99')).toEqual(2);
  expect(precision('999')).toEqual(3);
  expect(precision('9999')).toEqual(4);
  expect(precision('99999')).toEqual(5);
  expect(precision('999999')).toEqual(6);
  expect(precision('9999999')).toEqual(7);
  expect(precision('99999999')).toEqual(8);
  expect(precision('999999999')).toEqual(9);
  expect(precision('9999999999')).toEqual(10);
  expect(precision('99999999999')).toEqual(11);

  expect(precision('0.99999999999999999999')).toEqual(20);
  expect(precision('99999999999999999999.99999999999999999999')).toEqual(40);
  expect(precision('0.000000000000000000000000000000000000001')).toEqual(1);
  expect(precision('1.000000000000000000000000000000000000001')).toEqual(40);
});

test('scale', () => {
  expect(scale('1')).toEqual(0);
  expect(scale('1234')).toEqual(0);
  expect(scale('1.234')).toEqual(3);
  expect(scale('1e3')).toEqual(-3);
  expect(scale('1e-3')).toEqual(3);
  expect(scale('0.99999999999999999999')).toEqual(20);
  expect(scale('0.000000000000000000000000000000000000001')).toEqual(39);
  expect(scale('1.000000000000000000000000000000000000001')).toEqual(39);
});

test('divmod pow10', () => {
  const d = new DivMod();
  expect(d.pow10(1234, 1)).toEqual([123, 4]);
  expect(d.pow10(1234, 2)).toEqual([12, 34]);
  expect(d.pow10(10001, 1)).toEqual([1000, 1]);
  expect(d.pow10(10001, 2)).toEqual([100, 1]);
  expect(d.pow10(10001, 3)).toEqual([10, 1]);
});

test('aligned exponent', () => {
  expect(parse('1.234').alignexp()).toEqual(0);
  expect(parse('1.234e0').alignexp()).toEqual(0);
  expect(parse('1.234e1').alignexp()).toEqual(1);
  expect(parse('1.234e2').alignexp()).toEqual(2);

  expect(parse('12.34').alignexp()).toEqual(1);
  expect(parse('12.34e0').alignexp()).toEqual(1);
  expect(parse('12.34e1').alignexp()).toEqual(2);
  expect(parse('12.34e2').alignexp()).toEqual(3);
  expect(parse('12.3456789').alignexp()).toEqual(1);
  expect(parse('.02').alignexp()).toEqual(-2);
});

test('move point', () => {
  expect(parse('1').movePoint(1)).toEqual(parse('1e1'));
  expect(parse('1e5').movePoint(1)).toEqual(parse('1e6'));
  expect(parse('1').movePoint(-1)).toEqual(parse('1e-1'));
  expect(parse('1.234').movePoint(-2)).toEqual(parse('1.234e-2'));

  expect(parse('1.234').movePoint(0).toString()).toEqual('1.234');
  expect(parse('1.234').movePoint(-2).toString()).toEqual('0.01234');
  expect(parse('1.234').movePoint(2).toString()).toEqual('123.4');
  expect(parse('1.234').movePoint(-6).toString()).toEqual('0.000001234');
  expect(parse('1.234').movePoint(6).toString()).toEqual('1234000');
});

test('shift left', () => {
  expect(parse('1.0').shiftleft(0)).toEqual(parse('1.0'));
  expect(parse('1.0').shiftleft(1)).toEqual(parse('10.0'));
  expect(parse('1.234').shiftleft(1)).toEqual(parse('12.340'));

  expect(parse('1234').shiftleft(0)).toEqual(parse('1234'));
  expect(parse('1234').shiftleft(1)).toEqual(parse('12340'));
  expect(parse('1234').shiftleft(2)).toEqual(parse('123400'));
  expect(parse('1234').shiftleft(3)).toEqual(parse('1234000'));
  expect(parse('1234').shiftleft(4)).toEqual(parse('12340000'));
  expect(parse('1234').shiftleft(5)).toEqual(parse('123400000'));
  expect(parse('1234').shiftleft(6)).toEqual(parse('1234000000'));
  expect(parse('1234').shiftleft(7)).toEqual(parse('12340000000'));
  expect(parse('1234').shiftleft(8)).toEqual(parse('123400000000'));
  expect(parse('1234').shiftleft(9)).toEqual(parse('1234000000000'));
});

test('shift right', () => {
  const m = RoundingMode.HALF_EVEN;
  expect(shr('155.578', 1, m)).toEqual(parse('155.58'));
  expect(shr('155.578', 2, m)).toEqual(parse('155.6'));
  expect(shr('155.578', 3, m)).toEqual(parse('156'));
  expect(shr('155.578', 4, m)).toEqual(parse('16e1'));
  expect(shr('155.578', 5, m)).toEqual(parse('2e2'));
  expect(shr('155.578', 6, m)).toEqual(parse('0e3'));
  expect(shr('155.578', 7, m)).toEqual(parse('0e-3'));

  expect(shr('1.545', 1, m)).toEqual(parse('1.54'));
  expect(shr('1.545', 2, m)).toEqual(parse('1.5'));
  expect(shr('1.545', 3, m)).toEqual(parse('2'));
  expect(shr('1.545', 4, m)).toEqual(parse('0e1'));
  expect(shr('1.545', 5, m)).toEqual(parse('0e2'));

  expect(shr('1.234', 1, m)).toEqual(parse('1.23'));
  expect(shr('1.234', 2, m)).toEqual(parse('1.2'));

  expect(shr('9999', 1, m)).toEqual(parse('1000e1'));
  expect(shr('9999', 2, m)).toEqual(parse('100e2'));

  expect(shr('999', 1, m)).toEqual(parse('100e1'));
  expect(shr('999', 2, m)).toEqual(parse('10e2'));

  expect(shr('99', 1, m)).toEqual(parse('10e1'));
  expect(shr('99', 2, m)).toEqual(parse('1e2'));

  expect(shr('9', 1, m)).toEqual(parse('1e1'));
  expect(shr('9', 2, m)).toEqual(parse('0e2'));
});

test('shift right rounding modes', () => {
  let m = RoundingMode.UP;
  expect(shr('5.5', 1, m)).toEqual(parse('6'));
  expect(shr('2.5', 1, m)).toEqual(parse('3'));
  expect(shr('1.6', 1, m)).toEqual(parse('2'));
  expect(shr('1.1', 1, m)).toEqual(parse('2'));
  expect(shr('1.0', 1, m)).toEqual(parse('1'));
  expect(shr('-1.0', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.1', 1, m)).toEqual(parse('-2'));
  expect(shr('-1.6', 1, m)).toEqual(parse('-2'));
  expect(shr('-2.5', 1, m)).toEqual(parse('-3'));
  expect(shr('-5.5', 1, m)).toEqual(parse('-6'));

  m = RoundingMode.DOWN;
  expect(shr('5.5', 1, m)).toEqual(parse('5'));
  expect(shr('2.5', 1, m)).toEqual(parse('2'));
  expect(shr('1.6', 1, m)).toEqual(parse('1'));
  expect(shr('1.1', 1, m)).toEqual(parse('1'));
  expect(shr('1.0', 1, m)).toEqual(parse('1'));
  expect(shr('-1.0', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.1', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.6', 1, m)).toEqual(parse('-1'));
  expect(shr('-2.5', 1, m)).toEqual(parse('-2'));
  expect(shr('-5.5', 1, m)).toEqual(parse('-5'));

  m = RoundingMode.CEILING;
  expect(shr('5.5', 1, m)).toEqual(parse('6'));
  expect(shr('2.5', 1, m)).toEqual(parse('3'));
  expect(shr('1.6', 1, m)).toEqual(parse('2'));
  expect(shr('1.1', 1, m)).toEqual(parse('2'));
  expect(shr('1.0', 1, m)).toEqual(parse('1'));
  expect(shr('-1.0', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.1', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.6', 1, m)).toEqual(parse('-1'));
  expect(shr('-2.5', 1, m)).toEqual(parse('-2'));
  expect(shr('-5.5', 1, m)).toEqual(parse('-5'));

  m = RoundingMode.FLOOR;
  expect(shr('5.5', 1, m)).toEqual(parse('5'));
  expect(shr('2.5', 1, m)).toEqual(parse('2'));
  expect(shr('1.6', 1, m)).toEqual(parse('1'));
  expect(shr('1.1', 1, m)).toEqual(parse('1'));
  expect(shr('1.0', 1, m)).toEqual(parse('1'));
  expect(shr('-1.0', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.1', 1, m)).toEqual(parse('-2'));
  expect(shr('-1.6', 1, m)).toEqual(parse('-2'));
  expect(shr('-2.5', 1, m)).toEqual(parse('-3'));
  expect(shr('-5.5', 1, m)).toEqual(parse('-6'));

  m = RoundingMode.HALF_UP;
  expect(shr('5.5', 1, m)).toEqual(parse('6'));
  expect(shr('2.5', 1, m)).toEqual(parse('3'));
  expect(shr('1.6', 1, m)).toEqual(parse('2'));
  expect(shr('1.1', 1, m)).toEqual(parse('1'));
  expect(shr('1.0', 1, m)).toEqual(parse('1'));
  expect(shr('-1.0', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.1', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.6', 1, m)).toEqual(parse('-2'));
  expect(shr('-2.5', 1, m)).toEqual(parse('-3'));
  expect(shr('-5.5', 1, m)).toEqual(parse('-6'));

  m = RoundingMode.HALF_DOWN;
  // same as TRUNCATE
  expect(shr('5.5', 1, m)).toEqual(parse('5'));
  expect(shr('2.5', 1, m)).toEqual(parse('2'));
  expect(shr('1.6', 1, m)).toEqual(parse('2'));
  expect(shr('1.1', 1, m)).toEqual(parse('1'));
  expect(shr('1.0', 1, m)).toEqual(parse('1'));
  expect(shr('-1.0', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.1', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.6', 1, m)).toEqual(parse('-2'));
  expect(shr('-2.5', 1, m)).toEqual(parse('-2'));
  expect(shr('-5.5', 1, m)).toEqual(parse('-5'));

  m = RoundingMode.HALF_EVEN;
  expect(shr('5.5', 1, m)).toEqual(parse('6'));
  expect(shr('2.5', 1, m)).toEqual(parse('2'));
  expect(shr('1.6', 1, m)).toEqual(parse('2'));
  expect(shr('1.1', 1, m)).toEqual(parse('1'));
  expect(shr('1.0', 1, m)).toEqual(parse('1'));
  expect(shr('-1.0', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.1', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.6', 1, m)).toEqual(parse('-2'));
  expect(shr('-2.5', 1, m)).toEqual(parse('-2'));
  expect(shr('-5.5', 1, m)).toEqual(parse('-6'));

  m = RoundingMode.ZERO_FIVE_UP;
  expect(shr('5.5', 1, m)).toEqual(parse('6'));
  expect(shr('2.5', 1, m)).toEqual(parse('2'));
  expect(shr('1.6', 1, m)).toEqual(parse('1'));
  expect(shr('1.1', 1, m)).toEqual(parse('1'));
  expect(shr('1.0', 1, m)).toEqual(parse('1'));
  expect(shr('-1.0', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.1', 1, m)).toEqual(parse('-1'));
  expect(shr('-1.6', 1, m)).toEqual(parse('-1'));
  expect(shr('-2.5', 1, m)).toEqual(parse('-2'));
  expect(shr('-5.5', 1, m)).toEqual(parse('-6'));
});

test('trailing zeros count', () => {
  expect(trailZeros('1')).toEqual(0);
  expect(trailZeros('100')).toEqual(2);
  expect(trailZeros('1.000')).toEqual(3);
  expect(trailZeros('1000000000000000000000')).toEqual(21);
});

test('trailing zeros strip', () => {
  expect(parse('1.234000').stripTrailingZeros()).toEqual(parse('1.234'));
  expect(parse('100e10').stripTrailingZeros()).toEqual(parse('1e12'));
  expect(parse('1.00e-10').stripTrailingZeros()).toEqual(parse('1e-10'));
});

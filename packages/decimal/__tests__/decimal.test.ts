import { Decimal, RoundingModeType } from '../src';
import { DivMod } from '../src/math';

const parse = (s: string) => new Decimal(s);
const cmp = (u: string, v: string, abs: boolean = false) => parse(u).compare(parse(v), abs);
const precision = (u: string) => parse(u).precision();
const scale = (u: string) => parse(u).scale();
const trailZeros = (u: string) => parse(u).trailingZeros();
const shr = (u: string, s: number, m: RoundingModeType) => parse(u).shiftright(s, m);

test('parse', () => {
  expect(parse('0')).toEqual({ data: [], exp: 0, sign: 0, flag: 0 });
  expect(parse('1')).toEqual({ data: [1], exp: 0, sign: 1, flag: 0 });
  expect(parse('.1')).toEqual({ data: [1], exp: -1, sign: 1, flag: 0});
  expect(parse('.000001')).toEqual({ data: [1], exp: -6, sign: 1, flag: 0 });
  expect(parse('1.2345')).toEqual({ data: [12345], exp: -4, sign: 1, flag: 0 });
  expect(parse('00001.2')).toEqual({ data: [12], exp: -1, sign: 1, flag: 0 });
  expect(parse('1000000')).toEqual({ data: [1000000], exp: 0, sign: 1, flag: 0 });
  expect(parse('10000000')).toEqual({ data: [0, 1], exp: 0, sign: 1, flag: 0 });
  expect(parse('100000000')).toEqual({ data: [0, 10], exp: 0, sign: 1, flag: 0 });
  expect(parse('1000000000')).toEqual({ data: [0, 100], exp: 0, sign: 1, flag: 0 });

  expect(parse('999999999')).toEqual({ data: [9999999, 99], exp: 0, sign: 1, flag: 0 });
  expect(parse('9999999999')).toEqual({ data: [9999999, 999], exp: 0, sign: 1, flag: 0 });

  expect(parse('+.1')).toEqual({ data: [1], exp: -1, sign: 1, flag: 0 });

  expect(parse('-.1')).toEqual({ data: [1], exp: -1, sign: -1, flag: 0 });
  expect(parse('-10')).toEqual({ data: [10], exp: 0, sign: -1, flag: 0 });

  expect(parse('-10E+5')).toEqual({ data: [10], exp: 5, sign: -1, flag: 0 });
  expect(parse('123.45e99')).toEqual({ data: [12345], exp: 97, sign: 1, flag: 0 });

  expect(parse('NaN')).toEqual({ data: [], exp: 0, sign: 0, flag: 1 });
  expect(parse('Infinity')).toEqual({ data: [], exp: 0, sign: 1, flag: 2 });
  expect(parse('-Infinity')).toEqual({ data: [], exp: 0, sign: -1, flag: 2 });
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

test('integer digits', () => {
  expect(parse('0').integerDigits()).toEqual(1);
  expect(parse('0.0001').integerDigits()).toEqual(1);
  expect(parse('1.1').integerDigits()).toEqual(1);
  expect(parse('1e-5').integerDigits()).toEqual(1);
  expect(parse('1e0').integerDigits()).toEqual(1);
  expect(parse('1e1').integerDigits()).toEqual(2);
  expect(parse('1e2').integerDigits()).toEqual(3);
  expect(parse('1e3').integerDigits()).toEqual(4);
  expect(parse('1e4').integerDigits()).toEqual(5);
  expect(parse('1e5').integerDigits()).toEqual(6);
  expect(parse('12345.999999').integerDigits()).toEqual(5);
  expect(parse('20000').integerDigits()).toEqual(5);
  expect(parse('2e5').integerDigits()).toEqual(6);
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

  expect(parse('1234567e5').operands()).toEqual(
    { n: 123456700000, i: 123456700000, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
  );

  expect(parse('9999999e10').operands()).toEqual(
    { n: 9990000000000, i: 9990000000000, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
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
  expect(cmp('12e4', '1.23e5')).toEqual(-1);
  expect(cmp('-12e4', '1.23e5')).toEqual(-1);
  expect(cmp('-1.23e5', '12e4')).toEqual(-1);
  expect(cmp('1.2345e-10', '12e4')).toEqual(-1);

  expect(cmp('10000000', '10000001')).toEqual(-1);
  expect(cmp('10000000', '10000000')).toEqual(0);
  expect(cmp('10000001', '10000000')).toEqual(1);

  expect(cmp('99999999999', '99999999998')).toEqual(1);
  expect(cmp('99999999999e-3', '99999999998')).toEqual(-1);
  expect(cmp('-99999999999e-10', '99999999998e-2')).toEqual(-1);

  expect(cmp('100000.2345666666e-7', '100000.23457e-7')).toEqual(-1);
  expect(cmp('100000.2345666666e-7', '100000.23447e-7')).toEqual(1);
  expect(cmp('100000000.2345666666e-7', '100020000.23447e-7')).toEqual(-1);
  expect(cmp('10000000000.2345666666e-7', '10000000000.23457e-7')).toEqual(-1);
  expect(cmp('10000000000.234566666666e-6', '10000000000.23457e-6')).toEqual(-1);

  expect(cmp('1', '2.0001')).toEqual(-1);
  expect(cmp('2.0001', '1')).toEqual(1);
  expect(cmp('2', '2.00000')).toEqual(0);
});

test('compare abs', () => {
  expect(cmp('0', '0', false)).toEqual(0);
  expect(cmp('-1', '1', false)).toEqual(-1);
  expect(cmp('1', '-1', false)).toEqual(1);
  expect(cmp('-15', '10', false)).toEqual(-1);
  expect(cmp('10', '-15', false)).toEqual(1);

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

test('set scale', () => {
  expect(parse('10.34567').setScale(-4)).toEqual(parse('0e4'));
  expect(parse('10.34567').setScale(-3)).toEqual(parse('0e3'));
  expect(parse('10.34567').setScale(-2)).toEqual(parse('0e2'));
  expect(parse('10.34567').setScale(-1)).toEqual(parse('1e1'));
  expect(parse('10.34567').setScale(0)).toEqual(parse('10'));
  expect(parse('10.34567').setScale(1)).toEqual(parse('10.3'));
  expect(parse('10.34567').setScale(2)).toEqual(parse('10.35'));
  expect(parse('10.34567').setScale(3)).toEqual(parse('10.346'));
  expect(parse('10.34567').setScale(4)).toEqual(parse('10.3457'));
  expect(parse('10.34567').setScale(5)).toEqual(parse('10.34567'));
  expect(parse('10.34567').setScale(6)).toEqual(parse('10.345670'));

  expect(parse('1034567').setScale(-6)).toEqual(parse('1e+6'));
  expect(parse('1034567').setScale(-5)).toEqual(parse('10e+5'));
  expect(parse('1034567').setScale(-4)).toEqual(parse('103e+4'));
  expect(parse('1034567').setScale(-3)).toEqual(parse('1035e+3'));
  expect(parse('1034567').setScale(-2)).toEqual(parse('10346e+2'));
  expect(parse('1034567').setScale(-1)).toEqual(parse('103457e+1'));
  expect(parse('1034567').setScale(0)).toEqual(parse('1034567'));
  expect(parse('1034567').setScale(1)).toEqual(parse('1034567.0'));
  expect(parse('1034567').setScale(2)).toEqual(parse('1034567.00'));
  expect(parse('1034567').setScale(3)).toEqual(parse('1034567.000'));

  expect(parse('12345.6').setScale(1)).toEqual(parse('12345.6'));
  expect(parse('12345.67').setScale(1)).toEqual(parse('12345.7'));
  expect(parse('12345.678').setScale(1)).toEqual(parse('12345.7'));
  expect(parse('12345.6781').setScale(1)).toEqual(parse('12345.7'));
  expect(parse('12345.67811').setScale(1)).toEqual(parse('12345.7'));
  expect(parse('12345.678111').setScale(1)).toEqual(parse('12345.7'));
  expect(parse('12345.6781111').setScale(1)).toEqual(parse('12345.7'));
  expect(parse('12345.67811111').setScale(1)).toEqual(parse('12345.7'));
  expect(parse('12345.678111111').setScale(1)).toEqual(parse('12345.7'));

  expect(parse('100599.99').setScale(-3)).toEqual(parse('101e3'));
});

test('abs', () => {
  expect(parse('0').abs()).toEqual(parse('0'));
  expect(parse('2.79').abs()).toEqual(parse('2.79'));
  expect(parse('12345.6789').abs()).toEqual(parse('12345.6789'));
  expect(parse('-2.79').abs()).toEqual(parse('2.79'));
  expect(parse('-12345.6789').abs()).toEqual(parse('12345.6789'));
});

test('to integer', () => {
  expect(parse('0.000').toInteger()).toEqual(parse('0'));
  expect(parse('0.999').toInteger()).toEqual(parse('0'));
  expect(parse('-0.999').toInteger()).toEqual(parse('0'));
  expect(parse('2.79').toInteger()).toEqual(parse('2'));
  expect(parse('12345.6789').toInteger()).toEqual(parse('12345'));
  expect(parse('-2.79').toInteger()).toEqual(parse('-2'));
  expect(parse('-12345.6789').toInteger()).toEqual(parse('-12345'));
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

test('to string', () => {
  expect(parse('-1.3e-5').toString()).toEqual('-0.000013');
  expect(parse('-2.9999998e-23').toString()).toEqual('-0.000000000000000000000029999998');

  expect(parse('0e10').toString()).toEqual('0');
  expect(parse('0e-10').toString()).toEqual('0');
});

test('to parts', () => {
  expect(parse('-15.1234e2').toParts()).toEqual([
    { type: 'minus', value: '-' },
    { type: 'integer', value: '1512' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '34' }
  ]);

  expect(parse('1.3e-5').toParts()).toEqual([
    { type: 'integer', value: '0' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '000013' }
  ]);
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

test('increment', () => {
  expect(parse('-1').increment()).toEqual(parse('0'));
  expect(parse('0').increment()).toEqual(parse('1'));
  expect(parse('0.9').increment()).toEqual(parse('1.9'));
  expect(parse('.1111111111111').increment()).toEqual(parse('1.1111111111111'));

  expect(parse('9').increment()).toEqual(parse('10'));
  expect(parse('99').increment()).toEqual(parse('100'));
  expect(parse('999').increment()).toEqual(parse('1000'));
  expect(parse('9999').increment()).toEqual(parse('10000'));
  expect(parse('99999').increment()).toEqual(parse('100000'));
  expect(parse('999999').increment()).toEqual(parse('1000000'));
  expect(parse('9999999').increment()).toEqual(parse('10000000'));
});

test('decrement', () => {
  expect(parse('-1').decrement()).toEqual(parse('-2'));
  expect(parse('1').decrement()).toEqual(parse('0'));
  expect(parse('1.9').decrement()).toEqual(parse('0.9'));
});

test('scientific', () => {
  expect(parse('0').scientific()).toEqual([parse('0'), 0]);
  expect(parse('1').scientific()).toEqual([parse('1'), 0]);
  expect(parse('-1.2').scientific()).toEqual([parse('-1.2'), 0]);

  expect(parse('0.0012').scientific()).toEqual([parse('1.2'), -3]);
  expect(parse('0.0001234').scientific()).toEqual([parse('1.234'), -4]);

  expect(parse('210').scientific()).toEqual([parse('2.10'), 2]);
  expect(parse('100000').scientific()).toEqual([parse('1.00000'), 5]);
  expect(parse('199999').scientific()).toEqual([parse('1.99999'), 5]);

  // alter minimum number of integer digits
  expect(parse('0').scientific(1)).toEqual([parse('0'), 0]);
  expect(parse('0').scientific(2)).toEqual([parse('0e1'), -1]);
  expect(parse('0').scientific(3)).toEqual([parse('0e2'), -2]);
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

  expect(parse('12345.234').shiftleft(1)).toEqual(parse('123452.340'));
  expect(parse('12345.234').shiftleft(2)).toEqual(parse('1234523.400'));
  expect(parse('12345.234').shiftleft(3)).toEqual(parse('12345234.000'));
  expect(parse('12345.234').shiftleft(4)).toEqual(parse('123452340.000'));

  expect(parse('12345678900000000000').shiftleft(10))
    .toEqual(parse('123456789000000000000000000000'));
});

test('shift right', () => {
  const m: RoundingModeType = 'half-even';
  expect(shr('155.578', 1, m)).toEqual(parse('155.58'));
  expect(shr('155.578', 2, m)).toEqual(parse('155.6'));
  expect(shr('155.578', 3, m)).toEqual(parse('156'));
  expect(shr('155.578', 4, m)).toEqual(parse('16e1'));
  expect(shr('155.578', 5, m)).toEqual(parse('2e2'));
  expect(shr('155.578', 6, m)).toEqual(parse('0e3'));
  expect(shr('155.578', 7, m)).toEqual(parse('0e4'));

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

  expect(shr('100000000000000', 12, m)).toEqual(parse('100e12'));
  expect(shr('100000000000000', 13, m)).toEqual(parse('10e13'));
  expect(shr('100000000000000', 14, m)).toEqual(parse('1e14'));

  expect(shr('99999', 1, m)).toEqual(parse('10000e1'));
  expect(shr('999999', 1, m)).toEqual(parse('100000e1'));
  expect(shr('9999999', 1, m)).toEqual(parse('1000000e1'));
  expect(shr('99999999', 1, m)).toEqual(parse('10000000e1'));
  expect(shr('999999999', 1, m)).toEqual(parse('100000000e1'));
});

test('shift right rounding modes', () => {
  let m: RoundingModeType = 'up';
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

  m = 'down';
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

  m = 'ceiling';
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

  m = 'floor';
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

  m = 'half-up';
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

  m = 'half-down';
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

  m = 'half-even';
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
  expect(parse('0e-2').stripTrailingZeros()).toEqual(parse('0'));
  expect(parse('0.000e-2').stripTrailingZeros()).toEqual(parse('0'));
});

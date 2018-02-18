import { Decimal, RoundingMode } from '../../../src/types/numbers';
import { DivMod, divide } from '../../../src/types/numbers/math';
import { DecimalFormat } from '../../../src/types/numbers/types';

const parse = (s: string) => new Decimal(s);
const parsedata = (s: string) => (new Decimal(s) as any).data;
const cmp = (u: string, v: string) => parse(u).compare(parse(v));
const add = (u: string, v: string) => parse(u).add(parse(v));
const sub = (u: string, v: string) => parse(u).subtract(parse(v));
const mul = (u: string, v: string) => parse(u).multiply(parse(v));
const div = (u: string, v: string) => parse(u).divide(parse(v));
const digits = (u: string) => parse(u).precision();
const isInteger = (u: string) => parse(u).isInteger();
const trailZeros = (u: string) => parse(u).trailingZeros();
const shr = (u: string, s: number, m: RoundingMode) => parse(u).shiftright(s, m);

test('basics', () => {
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

test('precision', () => {
  expect(parse('0').precision()).toEqual(1);
  expect(parse('1').precision()).toEqual(1);
  expect(parse('1000').precision()).toEqual(4);
  expect(parse('1.234').precision()).toEqual(4);
  expect(parse('123e10').precision()).toEqual(3);
});

test('scale', () => {
  expect(parse('1').scale()).toEqual(0);
  expect(parse('1234').scale()).toEqual(0);
  expect(parse('1.234').scale()).toEqual(3);
  expect(parse('1e3').scale()).toEqual(-3);
});

test('format', () => {
  const opts: DecimalFormat = {
    decimal: '.',
    group: ',',
    minIntDigits: 1,
    minGroupingDigits: 1,
    primaryGroupSize: 3,
    secondaryGroupSize: 4
  };
  expect(parse('.00123').format(opts)).toEqual('0.00123');
  expect(parse('123456789.1234005').format(opts)).toEqual('12,3456,789.1234005');
  expect(parse('1e5').format(opts)).toEqual('10,000');
  expect(parse('123000000000000000000.000000456000000000000').format(opts)).toEqual(
    '12,3000,0000,0000,0000,000.000000456000000000000');
});

test('add', () => {
  expect(add('0', '0')).toEqual(parse('0'));
  expect(add('12', '0')).toEqual(parse('12'));
  expect(add('123', '456')).toEqual(parse('579'));
  expect(add('12345', '1000000001')).toEqual(parse('1000012346'));

  expect(add('1.234', '100')).toEqual(parse('101.234'));
  expect(add('12.34', '123.45')).toEqual(parse('135.79'));
  expect(add('12345.1', '.00001')).toEqual(parse('12345.10001'));

  expect(add('1.234', '50e1')).toEqual(parse('501.234'));
  expect(add('12.34', '50e1')).toEqual(parse('512.34'));

  expect(add('-1.234', '-50e1')).toEqual(parse('-501.234'));

  expect(add('9999', '2')).toEqual(parse('10001'));
  expect(add('99999', '2')).toEqual(parse('100001'));
  expect(add('999999', '2')).toEqual(parse('1000001'));
  expect(add('9999999', '2')).toEqual(parse('10000001'));
  expect(add('99999999', '2')).toEqual(parse('100000001'));
  expect(add('999999999', '2')).toEqual(parse('1000000001'));
  expect(add('9999999999', '2')).toEqual(parse('10000000001'));
  expect(add('99999999999', '2')).toEqual(parse('100000000001'));

  expect(add('2', '9999')).toEqual(parse('10001'));
  expect(add('2', '99999')).toEqual(parse('100001'));
  expect(add('2', '999999')).toEqual(parse('1000001'));
  expect(add('2', '9999999')).toEqual(parse('10000001'));
  expect(add('2', '99999999')).toEqual(parse('100000001'));
  expect(add('2', '999999999')).toEqual(parse('1000000001'));
  expect(add('2', '9999999999')).toEqual(parse('10000000001'));
  expect(add('2', '99999999999')).toEqual(parse('100000000001'));
});

test('subtract', () => {
  expect(sub('543', '200')).toEqual(parse('343'));
  expect(sub('1000000000', '1')).toEqual(parse('999999999'));
  expect(sub('12.3456789', '.020406')).toEqual(parse('12.3252729'));

  expect(sub('-54321', '-321')).toEqual(parse('-54000'));
  expect(sub('-54.0321', '-.0321')).toEqual(parse('-54.0000'));
});

test('multiply', () => {
  expect(mul('1.234', '0')).toEqual(parse('0'));
  expect(mul('-1.234', '0')).toEqual(parse('0'));

  expect(mul('15', '100')).toEqual(parse('1500'));
  expect(mul('15000000', '100000')).toEqual(parse('1500000000000'));

  expect(mul('100123', '5')).toEqual(parse('500615'));
  expect(mul('1000123', '5')).toEqual(parse('5000615'));
  expect(mul('10000123', '5')).toEqual(parse('50000615'));
  expect(mul('100000123', '5')).toEqual(parse('500000615'));

  expect(mul('-1000123', '-500')).toEqual(parse('500061500'));
  expect(mul('-1000123', '-5000')).toEqual(parse('5000615000'));
  expect(mul('-1000123', '-50000')).toEqual(parse('50006150000'));

  expect(mul('-1000.123', '500')).toEqual(parse('-500061.500'));
  expect(mul('-1000.12317', '500')).toEqual(parse('-500061.58500'));
  expect(mul('-.12345', '999')).toEqual(parse('-123.32655'));

  expect(mul('9999999999.999', '2')).toEqual(parse('19999999999.998'));

  expect(mul('1.5', '-30.7')).toEqual(parse('-46.05'));
  expect(mul('-1.11111112', '7.35')).toEqual(parse('-8.1666667320'));
});

test('divide', () => {
  expect(div('99999', '10')).toEqual(parse('9999'));
  expect(div('99899999001', '999')).toEqual(parse('99999999'));
  expect(div('99799999002', '998')).toEqual(parse('99999999'));
  expect(div('9999999999999999999999', '9999999999999999999')).toEqual(parse('1000'));

  expect(div('10000000000', '99000000')).toEqual(parse('101'));
  expect(div('99899999001', '1199999999')).toEqual(parse('83'));
  expect(div('9999999999999', '55555555555')).toEqual(parse('180'));

  // TODO:
  // console.log(divide(parsedata('100'), parsedata('99')));
  // console.log(divide(parsedata('100000000'), parsedata('99000000')));
  // console.log(div('123456789', '.1'));
  // console.log(div('123456789', '1'));
  // console.log(div('123456789', '10'));
});

test('divide decrements qhat', () => {
  // Cases that cause qhat to be decremented
  expect(div('96441598043416655685', '13367828761276')).toEqual(parse('7214454'));
  expect(div('35314321308673059375', '16403941393069')).toEqual(parse('2152794'));
});

test('divide add back', () => {
  // Causes D6 to be executed.
  // TODO: Generate more cases
  const u = '88888888888888888888888888888888888888888888888888';
  const v = '333333333333635';
  const w = '266666666666425333333333551739999999';
  expect(div(u, v)).toEqual(parse(w));
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
});

test('digits', () => {
  expect(digits('0')).toEqual(1);
  expect(digits('1')).toEqual(1);
  expect(digits('-1')).toEqual(1);
  expect(digits('3.45')).toEqual(3);
  expect(digits('10001')).toEqual(5);
  expect(digits('10001.10001')).toEqual(10);

  expect(digits('9')).toEqual(1);
  expect(digits('99')).toEqual(2);
  expect(digits('999')).toEqual(3);
  expect(digits('9999')).toEqual(4);
  expect(digits('99999')).toEqual(5);
  expect(digits('999999')).toEqual(6);
  expect(digits('9999999')).toEqual(7);
  expect(digits('99999999')).toEqual(8);
  expect(digits('999999999')).toEqual(9);
  expect(digits('9999999999')).toEqual(10);
  expect(digits('99999999999')).toEqual(11);

  expect(digits('99999999999999999999.99999999999999999999')).toEqual(40);
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
  // expect(parse('1e5').movePoint(1)).toEqual(parse('1e6'));
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
  // expect(shr('9', 1, m)).toEqual(parse('1e1'));
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

test('invalid', () => {
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

test('is integer', () => {
  expect(isInteger('0')).toEqual(true);
  expect(isInteger('1')).toEqual(true);
  expect(isInteger('123')).toEqual(true);
  expect(isInteger('123.0')).toEqual(true);
  expect(isInteger('.123e3')).toEqual(true);

  expect(isInteger('0.1')).toEqual(false);
  expect(isInteger('123.01')).toEqual(false);
  expect(isInteger('123e-3')).toEqual(false);
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

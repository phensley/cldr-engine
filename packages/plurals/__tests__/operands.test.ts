import { Decimal } from '@phensley/decimal';
import { NumberOperands } from '../src';
import { digitCount } from '../src/operands';

const operands = (n: string, c: number = 0) => new NumberOperands(new Decimal(n), c).toString();

test('foo', () => {
  let ops: string;

  ops = operands('1000000.0');
  expect(ops).toEqual('n: 1000000, i: 1000000, v: 1, w: 0, f: 0, t: 0, c: 0');
});

// Examples from https://www.unicode.org/reports/tr35/tr35-numbers.html#Operands
test('tr35 examples', () => {
  let ops: string;

  ops = operands('1');
  expect(ops).toEqual('n: 1, i: 1, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('1.0');
  expect(ops).toEqual('n: 1, i: 1, v: 1, w: 0, f: 0, t: 0, c: 0');

  ops = operands('1.00');
  expect(ops).toEqual('n: 1, i: 1, v: 2, w: 0, f: 0, t: 0, c: 0');

  ops = operands('1.3');
  expect(ops).toEqual('n: 1, i: 1, v: 1, w: 1, f: 3, t: 3, c: 0');

  ops = operands('1.30');
  expect(ops).toEqual('n: 1, i: 1, v: 2, w: 1, f: 30, t: 3, c: 0');

  ops = operands('1.03');
  expect(ops).toEqual('n: 1, i: 1, v: 2, w: 2, f: 3, t: 3, c: 0');

  ops = operands('1.230');
  expect(ops).toEqual('n: 1, i: 1, v: 3, w: 2, f: 230, t: 23, c: 0');

  ops = operands('1200000');
  expect(ops).toEqual('n: 1200000, i: 1200000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('1.2e6', 6);
  expect(ops).toEqual('n: 1200000, i: 1200000, v: 0, w: 0, f: 0, t: 0, c: 6');

  ops = operands('123e6', 6);
  expect(ops).toEqual('n: 123000000, i: 123000000, v: 0, w: 0, f: 0, t: 0, c: 6');

  ops = operands('123e5', 5);
  expect(ops).toEqual('n: 12300000, i: 12300000, v: 0, w: 0, f: 0, t: 0, c: 5');

  ops = operands('1200.50');
  expect(ops).toEqual('n: 1200, i: 1200, v: 2, w: 1, f: 50, t: 5, c: 0');

  ops = operands('1.20050e3', 3);
  expect(ops).toEqual('n: 1200, i: 1200, v: 2, w: 1, f: 50, t: 5, c: 3');
});

test('basics', () => {
  let ops: string;

  ops = operands('nan');
  expect(ops).toEqual('n: 0, i: 0, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('infinity');
  expect(ops).toEqual('n: 0, i: 0, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('-infinity');
  expect(ops).toEqual('n: 0, i: 0, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('0');
  expect(ops).toEqual('n: 0, i: 0, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('0.00');
  expect(ops).toEqual('n: 0, i: 0, v: 2, w: 0, f: 0, t: 0, c: 0');

  ops = operands('1');
  expect(ops).toEqual('n: 1, i: 1, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('1.0');
  expect(ops).toEqual('n: 1, i: 1, v: 1, w: 0, f: 0, t: 0, c: 0');

  ops = operands('1', -5);
  expect(ops).toEqual('n: 1, i: 1, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('1e-3');
  expect(ops).toEqual('n: 0, i: 0, v: 3, w: 3, f: 1, t: 1, c: 0');

  ops = operands('1e2', 2);
  expect(ops).toEqual('n: 100, i: 100, v: 0, w: 0, f: 0, t: 0, c: 2');

  ops = operands('123.12', 2);
  expect(ops).toEqual('n: 123, i: 123, v: 2, w: 2, f: 12, t: 12, c: 2');

  ops = operands('-123.400', 2);
  expect(ops).toEqual('n: 123, i: 123, v: 3, w: 1, f: 400, t: 4, c: 2');

  ops = operands('-1234567890.12300');
  expect(ops).toEqual('n: 1234567890, i: 1234567890, v: 5, w: 3, f: 12300, t: 123, c: 0');

  ops = operands('0.1234567890123456789');
  expect(ops).toEqual('n: 0, i: 0, v: 19, w: 19, f: 12345678901234, t: 12345678901234, c: 0');

  ops = operands('1234567890123456789.12345000');
  expect(ops).toEqual('n: 17890123456789, i: 17890123456789, v: 8, w: 5, f: 12345000, t: 12345, c: 0');

  ops = operands('1234567e5');
  expect(ops).toEqual('n: 123456700000, i: 123456700000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('9999999e10');
  expect(ops).toEqual('n: 19990000000000, i: 19990000000000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('-5.23000');
  expect(ops).toEqual('n: 5, i: 5, v: 5, w: 2, f: 23000, t: 23, c: 0');

  ops = operands('-510.00120');
  expect(ops).toEqual('n: 510, i: 510, v: 5, w: 4, f: 120, t: 12, c: 0');

  ops = operands('10230.122');
  expect(ops).toEqual('n: 10230, i: 10230, v: 3, w: 3, f: 122, t: 122, c: 0');
});

test('tens', () => {
  let ops: string;

  // For multiples of ten that exceed our limit for the number type, we have a special
  // rule that tries to (a) the number still has approximately the same magnitude
  // and (b) preserve as many of the least-significant digits as possible.

  ops = operands('10000000000000');
  expect(ops).toEqual('n: 10000000000000, i: 10000000000000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('20000000000000');
  expect(ops).toEqual('n: 10000000000000, i: 10000000000000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('2123000000000');
  expect(ops).toEqual('n: 2123000000000, i: 2123000000000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('20123000000000');
  expect(ops).toEqual('n: 10123000000000, i: 10123000000000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('20012300000000');
  expect(ops).toEqual('n: 10012300000000, i: 10012300000000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('20001230000000');
  expect(ops).toEqual('n: 10001230000000, i: 10001230000000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('20000123000000');
  expect(ops).toEqual('n: 10000123000000, i: 10000123000000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('20000012300000');
  expect(ops).toEqual('n: 10000012300000, i: 10000012300000, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('20000000000001');
  expect(ops).toEqual('n: 10000000000001, i: 10000000000001, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('20000001230000000');
  expect(ops).toEqual('n: 10001230000000, i: 10001230000000, v: 0, w: 0, f: 0, t: 0, c: 0');
});

test('digit count', () => {
  expect(digitCount(9)).toEqual(1);
  expect(digitCount(99)).toEqual(2);
  expect(digitCount(999)).toEqual(3);
  expect(digitCount(9999)).toEqual(4);
  expect(digitCount(99999)).toEqual(5);
  expect(digitCount(999999)).toEqual(6);
  expect(digitCount(9999999)).toEqual(7);
  expect(digitCount(99999999)).toEqual(8);
});

test('overflow', () => {
  let ops = operands('111222333444555666777888999');
  expect(ops).toEqual('n: 15666777888999, i: 15666777888999, v: 0, w: 0, f: 0, t: 0, c: 0');

  ops = operands('0.111222333444555666777888999');
  expect(ops).toEqual('n: 0, i: 0, v: 27, w: 27, f: 11122233344455, t: 11122233344455, c: 0');

  ops = operands('-99999999999999999999.99999999999999999999');
  expect(ops).toEqual('n: 19999999999999, i: 19999999999999, v: 20, w: 20, f: 99999999999999, t: 99999999999999, c: 0');
});

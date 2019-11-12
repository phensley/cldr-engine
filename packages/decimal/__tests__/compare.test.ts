import { Decimal } from '../src';

const parse = (s: string) => new Decimal(s);
const cmp = (u: string, v: string, abs: boolean = false) => parse(u).compare(parse(v), abs);

test('compare', () => {
  expect(cmp('0', '0')).toEqual(0);
  expect(cmp('1', '1')).toEqual(0);
  expect(cmp('-1', '1')).toEqual(-1);
  expect(cmp('1', '-1')).toEqual(1);
  expect(cmp('-1', '-1')).toEqual(0);
  expect(cmp('2', '1')).toEqual(1);
  expect(cmp('1', '2')).toEqual(-1);

  expect(cmp('0', '0.0')).toEqual(0);
  expect(cmp('1.000', '1.0')).toEqual(0);

  expect(cmp('0.00500000', '0.005')).toEqual(0);

  expect(cmp('0', '23')).toEqual(-1);
  expect(cmp('0', '-23')).toEqual(1);
  expect(cmp('23', '0')).toEqual(1);
  expect(cmp('-23', '0')).toEqual(-1);

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

  expect(cmp('120000.2345666666e-7', '100030.232566666e-7')).toEqual(1);

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

import { Decimal } from '../src';

const parse = (n: string) => new Decimal(n);
const add = (u: string, v: string) => new Decimal(u).add(new Decimal(v));

test('addition', () => {
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
  expect(add('-1.234', '.001')).toEqual(parse('-1.233'));

});

test('addition carry', () => {
  expect(add('9999', '2')).toEqual(parse('10001'));
  expect(add('99999', '2')).toEqual(parse('100001'));
  expect(add('999999', '2')).toEqual(parse('1000001'));
  expect(add('9999999', '2')).toEqual(parse('10000001'));
  expect(add('99999999', '2')).toEqual(parse('100000001'));
  expect(add('999999999', '2')).toEqual(parse('1000000001'));
  expect(add('9999999999', '2')).toEqual(parse('10000000001'));
  expect(add('99999999999', '2')).toEqual(parse('100000000001'));
  expect(add('999999999999', '2')).toEqual(parse('1000000000001'));

  expect(add('2', '9999')).toEqual(parse('10001'));
  expect(add('2', '99999')).toEqual(parse('100001'));
  expect(add('2', '999999')).toEqual(parse('1000001'));
  expect(add('2', '9999999')).toEqual(parse('10000001'));
  expect(add('2', '99999999')).toEqual(parse('100000001'));
  expect(add('2', '999999999')).toEqual(parse('1000000001'));
  expect(add('2', '9999999999')).toEqual(parse('10000000001'));
  expect(add('2', '99999999999')).toEqual(parse('100000000001'));
  expect(add('2', '999999999999')).toEqual(parse('1000000000001'));
});

test('addition opposite sign', () => {
  expect(add('100.00', '-1')).toEqual(parse('99.00'));
});

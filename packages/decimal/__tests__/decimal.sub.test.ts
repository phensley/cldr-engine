import { Decimal } from '../src';

const parse = (n: string) => new Decimal(n);
const sub = (u: string, v: string) => new Decimal(u).subtract(new Decimal(v));

test('subtraction', () => {
  expect(sub('1', '1')).toEqual(parse('0'));
  expect(sub('1', '-1')).toEqual(parse('2'));

  expect(sub('-1', '1')).toEqual(parse('-2'));
  expect(sub('-1', '-1')).toEqual(parse('-0'));

  expect(sub('1000050000000', '50000000')).toEqual(parse('1000000000000'));
  expect(sub('50000000', '1000050000000')).toEqual(parse('-1000000000000'));

  expect(sub('9999999999', '0.00000000001')).toEqual(parse('9999999998.99999999999'));
  expect(sub('0.00000000001', '9999999999')).toEqual(parse('-9999999998.99999999999'));

  expect(sub('543', '200')).toEqual(parse('343'));
  expect(sub('200', '543')).toEqual(parse('-343'));

  expect(sub('0', '0.000000000001')).toEqual(parse('-0.000000000001'));
  expect(sub('0.000000000001', '0')).toEqual(parse('0.000000000001'));
  expect(sub('0', '2.5')).toEqual(parse('-2.5'));

  expect(sub('1', '0.000000000001')).toEqual(parse('0.999999999999'));
  expect(sub('0.000000000001', '1')).toEqual(parse('-0.999999999999'));

  expect(sub('1000000000', '1')).toEqual(parse('999999999'));
  expect(sub('12.3456789', '.020406')).toEqual(parse('12.3252729'));

  expect(sub('-54321', '-321')).toEqual(parse('-54000'));
  expect(sub('-54.0321', '-.0321')).toEqual(parse('-54.0000'));
});

test('subtraction coverage', () => {
  expect(sub('999998910', '99999909')).toEqual(parse('899999001'));
  expect(sub('1000000000000999998910', '10000999598910')).toEqual(parse('999999990000000400000'));
});

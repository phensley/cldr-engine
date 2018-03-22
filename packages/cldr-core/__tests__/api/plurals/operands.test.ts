import { Decimal } from '../../../src/types/numbers';

const operands = (n: string) => new Decimal(n).operands();

test('basics', () => {
  let ops = operands('-5.23000');
  expect(ops.neg).toEqual(true);
  expect(ops.dec).toEqual(true);
  expect(ops.n).toEqual(5);
  expect(ops.i).toEqual(5);
  expect(ops.v).toEqual(5);
  expect(ops.w).toEqual(2);
  expect(ops.f).toEqual(23000);
  expect(ops.t).toEqual(23);

  ops = operands('-510.00120');
  expect(ops.neg).toEqual(true);
  expect(ops.dec).toEqual(true);
  expect(ops.n).toEqual(510);
  expect(ops.i).toEqual(510);
  expect(ops.v).toEqual(5);
  expect(ops.w).toEqual(4);
  expect(ops.f).toEqual(120);
  expect(ops.t).toEqual(12);

  ops = operands('10230.122');
  expect(ops.neg).toEqual(false);
  expect(ops.dec).toEqual(true);
  expect(ops.n).toEqual(10230);
  expect(ops.i).toEqual(10230);
  expect(ops.v).toEqual(3);
  expect(ops.w).toEqual(3);
  expect(ops.f).toEqual(122);
  expect(ops.t).toEqual(122);
});

test('overflow', () => {
  let ops = operands('111222333444555666777888999');
  expect(ops.neg).toEqual(false);
  expect(ops.dec).toEqual(false);
  expect(ops.n).toEqual(5666777888999);
  expect(ops.i).toEqual(5666777888999);
  expect(ops.v).toEqual(0);
  expect(ops.w).toEqual(0);
  expect(ops.f).toEqual(0);
  expect(ops.t).toEqual(0);

  ops = operands('0.111222333444555666777888999');
  expect(ops.neg).toEqual(false);
  expect(ops.dec).toEqual(true);
  expect(ops.n).toEqual(0);
  expect(ops.i).toEqual(0);
  expect(ops.v).toEqual(27);
  expect(ops.w).toEqual(27);
  expect(ops.f).toEqual(11122233344455);
  expect(ops.t).toEqual(11122233344455);

  ops = operands('-99999999999999999999.99999999999999999999');
  expect(ops.neg).toEqual(true);
  expect(ops.dec).toEqual(true);
  expect(ops.n).toEqual(9999999999999);
  expect(ops.i).toEqual(9999999999999);
  expect(ops.v).toEqual(20);
  expect(ops.w).toEqual(20);
  expect(ops.f).toEqual(99999999999999);
  expect(ops.t).toEqual(99999999999999);
});

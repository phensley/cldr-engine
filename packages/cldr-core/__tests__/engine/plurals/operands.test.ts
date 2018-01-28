import { NumberOperands } from '../../../src/engine/plurals/operands';

test('basics', () => {
  let ops = new NumberOperands('-5.23000');
  expect(ops.negative).toEqual(true);
  expect(ops.decimal).toEqual(true);
  expect(ops.n).toEqual(5);
  expect(ops.i).toEqual(5);
  expect(ops.v).toEqual(5);
  expect(ops.w).toEqual(2);
  expect(ops.f).toEqual(23000);
  expect(ops.t).toEqual(23);
  expect(ops.z).toEqual(0);

  ops = new NumberOperands('-510.00120');
  expect(ops.negative).toEqual(true);
  expect(ops.decimal).toEqual(true);
  expect(ops.n).toEqual(510);
  expect(ops.i).toEqual(510);
  expect(ops.v).toEqual(5);
  expect(ops.w).toEqual(4);
  expect(ops.f).toEqual(120);
  expect(ops.t).toEqual(12);
  expect(ops.z).toEqual(2);

  ops = new NumberOperands('10230.122');
  expect(ops.negative).toEqual(false);
  expect(ops.decimal).toEqual(true);
  expect(ops.n).toEqual(10230);
  expect(ops.i).toEqual(10230);
  expect(ops.v).toEqual(3);
  expect(ops.w).toEqual(3);
  expect(ops.f).toEqual(122);
  expect(ops.t).toEqual(122);
  expect(ops.z).toEqual(0);
});

test('overflow', () => {
  let ops = new NumberOperands('111222333444555666777888999');
  expect(ops.negative).toEqual(false);
  expect(ops.decimal).toEqual(false);
  expect(ops.n).toEqual(5666777888999);
  expect(ops.i).toEqual(5666777888999);
  expect(ops.v).toEqual(0);
  expect(ops.w).toEqual(0);
  expect(ops.f).toEqual(0);
  expect(ops.t).toEqual(0);
  expect(ops.z).toEqual(0);

  ops = new NumberOperands('0.111222333444555666777888999');
  expect(ops.negative).toEqual(false);
  expect(ops.decimal).toEqual(true);
  expect(ops.n).toEqual(0);
  expect(ops.i).toEqual(0);
  expect(ops.v).toEqual(14);
  expect(ops.w).toEqual(14);
  expect(ops.f).toEqual(11122233344455);
  expect(ops.t).toEqual(11122233344455);
  expect(ops.z).toEqual(0);

  ops = new NumberOperands('-99999999999999999999.99999999999999999999');
  expect(ops.negative).toEqual(true);
  expect(ops.decimal).toEqual(true);
  expect(ops.n).toEqual(9999999999999);
  expect(ops.i).toEqual(9999999999999);
  expect(ops.v).toEqual(14);
  expect(ops.w).toEqual(14);
  expect(ops.f).toEqual(99999999999999);
  expect(ops.t).toEqual(99999999999999);
  expect(ops.z).toEqual(0);
});

test('invalid data', () => {
  let ops = new NumberOperands('1x...');
  expect(ops).toEqual({ negative: false, decimal: false, n: 1, i: 1, v: 0, w: 0, f: 0, t: 0, z: 0});
  ops = new NumberOperands('3.1...');
  expect(ops).toEqual({ negative: false, decimal: true, n: 3, i: 3, v: 1, w: 1, f: 1, t: 1, z: 0});
  ops = new NumberOperands('1.230xyz');
  expect(ops).toEqual({ negative: false, decimal: true, n: 1, i: 1, v: 3, w: 2, f: 230, t: 23, z: 0});
});

import { Decimal, RoundingModeType } from '../src';

const parse = (s: string) => new Decimal(s);
const shr = (u: string, s: number, m: RoundingModeType) =>
  parse(u).shiftright(s, m);

test('shift to rounding', () => {
  expect(shr('0.99', 3, 'up')).toEqual(parse('0e1'));
  expect(shr('0.99', 2, 'up')).toEqual(parse('1'));
  expect(shr('0.99', 1, 'up')).toEqual(parse('1.0'));

  // half-even
  expect(shr('0.67', 3, 'half-even')).toEqual(parse('0e1'));
  expect(shr('0.67', 2, 'half-even')).toEqual(parse('1'));
  expect(shr('0.67', 1, 'half-even')).toEqual(parse('.7'));

  // half-up
  expect(shr('0.1', 3, 'half-up')).toEqual(parse('0e2'));
  expect(shr('0.1', 2, 'half-up')).toEqual(parse('0e1'));
  expect(shr('0.1', 1, 'half-up')).toEqual(parse('0'));
  expect(shr('0.1', 0, 'half-up')).toEqual(parse('0.1'));

  expect(shr('0.5', 3, 'half-up')).toEqual(parse('0e2'));
  expect(shr('0.5', 2, 'half-up')).toEqual(parse('0e1'));
  expect(shr('0.5', 1, 'half-up')).toEqual(parse('1'));
  expect(shr('0.5', 0, 'half-up')).toEqual(parse('0.5'));

  expect(shr('0.9', 3, 'half-up')).toEqual(parse('0e2'));
  expect(shr('0.9', 2, 'half-up')).toEqual(parse('0e1'));
  expect(shr('0.9', 1, 'half-up')).toEqual(parse('1'));
  expect(shr('0.9', 0, 'half-up')).toEqual(parse('0.9'));

  expect(shr('0.90', 3, 'half-up')).toEqual(parse('0e1'));
  expect(shr('0.90', 2, 'half-up')).toEqual(parse('1'));
  expect(shr('0.90', 1, 'half-up')).toEqual(parse('0.9'));
  expect(shr('0.90', 0, 'half-up')).toEqual(parse('0.90'));

  expect(shr('2.17', 4, 'half-up')).toEqual(parse('0e2'));
  expect(shr('2.17', 3, 'half-up')).toEqual(parse('0e1'));
  expect(shr('2.17', 2, 'half-up')).toEqual(parse('2'));
  expect(shr('2.17', 1, 'half-up')).toEqual(parse('2.2'));
});

test('shift to zero', () => {
  expect(shr('-10000000000', 10, 'up')).toEqual(parse('-1e10'));
  expect(shr('-20000000000', 10, 'up')).toEqual(parse('-2e10'));
  expect(shr('-30000000000', 10, 'up')).toEqual(parse('-3e10'));

  expect(shr('-10000000000', 11, 'up')).toEqual(parse('-0e11'));
  expect(shr('-20000000000', 11, 'up')).toEqual(parse('-0e11'));
  expect(shr('-30000000000', 11, 'up')).toEqual(parse('-0e11'));

  expect(shr('-10000000000', 12, 'up')).toEqual(parse('-0e12'));
  expect(shr('-20000000000', 12, 'up')).toEqual(parse('-0e12'));
  expect(shr('-30000000000', 12, 'up')).toEqual(parse('-0e12'));

  expect(shr('10', 1, 'up')).toEqual(parse('1e1'));
  expect(shr('10', 2, 'up')).toEqual(parse('0e2'));
  expect(shr('10', 3, 'up')).toEqual(parse('0e3'));

  expect(shr('100', 1, 'up')).toEqual(parse('10e1'));
  expect(shr('100', 2, 'up')).toEqual(parse('1e2'));
  expect(shr('100', 3, 'up')).toEqual(parse('0e3'));
  expect(shr('100', 4, 'up')).toEqual(parse('0e4'));

  expect(shr('1000', 1, 'up')).toEqual(parse('100e1'));
  expect(shr('1000', 2, 'up')).toEqual(parse('10e2'));
  expect(shr('1000', 3, 'up')).toEqual(parse('1e3'));
  expect(shr('1000', 4, 'up')).toEqual(parse('0e4'));
  expect(shr('1000', 5, 'up')).toEqual(parse('0e5'));

  expect(shr('10000', 1, 'up')).toEqual(parse('1000e1'));
  expect(shr('10000', 2, 'up')).toEqual(parse('100e2'));
  expect(shr('10000', 3, 'up')).toEqual(parse('10e3'));
  expect(shr('10000', 4, 'up')).toEqual(parse('1e4'));
  expect(shr('10000', 5, 'up')).toEqual(parse('0e5'));
  expect(shr('10000', 6, 'up')).toEqual(parse('0e6'));

  expect(shr('100000', 1, 'up')).toEqual(parse('10000e1'));
  expect(shr('100000', 2, 'up')).toEqual(parse('1000e2'));
  expect(shr('100000', 3, 'up')).toEqual(parse('100e3'));
  expect(shr('100000', 4, 'up')).toEqual(parse('10e4'));
  expect(shr('100000', 5, 'up')).toEqual(parse('1e5'));
  expect(shr('100000', 6, 'up')).toEqual(parse('0e6'));
  expect(shr('100000', 7, 'up')).toEqual(parse('0e7'));

  expect(shr('1000000', 1, 'up')).toEqual(parse('100000e1'));
  expect(shr('1000000', 2, 'up')).toEqual(parse('10000e2'));
  expect(shr('1000000', 3, 'up')).toEqual(parse('1000e3'));
  expect(shr('1000000', 4, 'up')).toEqual(parse('100e4'));
  expect(shr('1000000', 5, 'up')).toEqual(parse('10e5'));
  expect(shr('1000000', 6, 'up')).toEqual(parse('1e6'));
  expect(shr('1000000', 7, 'up')).toEqual(parse('0e7'));
  expect(shr('1000000', 8, 'up')).toEqual(parse('0e8'));

  expect(shr('10000000', 1, 'up')).toEqual(parse('1000000e1'));
  expect(shr('10000000', 2, 'up')).toEqual(parse('100000e2'));
  expect(shr('10000000', 3, 'up')).toEqual(parse('10000e3'));
  expect(shr('10000000', 4, 'up')).toEqual(parse('1000e4'));
  expect(shr('10000000', 5, 'up')).toEqual(parse('100e5'));
  expect(shr('10000000', 6, 'up')).toEqual(parse('10e6'));
  expect(shr('10000000', 7, 'up')).toEqual(parse('1e7'));
  expect(shr('10000000', 8, 'up')).toEqual(parse('0e8'));
  expect(shr('10000000', 9, 'up')).toEqual(parse('0e9'));

  expect(shr('-1000000', 5, 'up')).toEqual(parse('-10e5'));
  expect(shr('-1000000', 6, 'up')).toEqual(parse('-1e6'));
  expect(shr('-1000000', 7, 'up')).toEqual(parse('-0e7'));
  expect(shr('-1000000', 8, 'up')).toEqual(parse('-0e8'));
  expect(shr('-1000000', 9, 'up')).toEqual(parse('-0e9'));
  expect(shr('-1000000', 10, 'up')).toEqual(parse('-0e10'));
  expect(shr('-1000000', 11, 'up')).toEqual(parse('-0e11'));

  expect(shr('-2000000', 5, 'up')).toEqual(parse('-20e5'));
  expect(shr('-2000000', 6, 'up')).toEqual(parse('-2e6'));
  expect(shr('-2000000', 7, 'up')).toEqual(parse('-0e7'));
  expect(shr('-2000000', 8, 'up')).toEqual(parse('-0e8'));
  expect(shr('-2000000', 9, 'up')).toEqual(parse('-0e9'));
  expect(shr('-2000000', 10, 'up')).toEqual(parse('-0e10'));
  expect(shr('-2000000', 11, 'up')).toEqual(parse('-0e11'));

  expect(shr('-10000000000', 12, 'up')).toEqual(parse('-0e12'));
  expect(shr('-10000000000', 12, 'up')).toEqual(parse('-0e12'));
});

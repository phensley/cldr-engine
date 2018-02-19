import { Decimal } from '../../../src';

const parse = (s: string) => new Decimal(s);
const mul = (u: string, v: string) => parse(u).multiply(parse(v));

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

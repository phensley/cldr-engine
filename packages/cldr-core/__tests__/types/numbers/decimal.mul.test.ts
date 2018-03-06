import { Decimal, DecimalConstants, MathContext } from '../../../src';

const parse = (s: string) => new Decimal(s);
const mul = (u: string, v: string, c?: MathContext) =>
  parse(u).multiply(parse(v), c);

test('multiply', () => {
  expect(mul('1.234', '0')).toEqual(parse('0.000'));
  expect(mul('-1.234', '0')).toEqual(parse('0.000'));

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

  expect(mul('10203040506070809010', '-9.876543210')).toEqual(parse('-100770770431588612506.9223221'));
});

test('multiply context', () => {
  const diameter = parse('8.8e26');
  let circ = diameter.multiply(DecimalConstants.PI);
  expect(circ).toEqual(parse('2764601535159018049847126177'));

  circ = diameter.multiply(DecimalConstants.PI, { precision: 40 });
  expect(circ).toEqual(parse('2764601535159018049847126177.285962538094'));
});

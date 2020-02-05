import { Decimal, DecimalConstants, MathContext } from '../src';

const parse = (s: string) => new Decimal(s);
const mul = (u: string, v: string, c?: MathContext) =>
  parse(u).multiply(parse(v), c);

test('multiply', () => {
  expect(mul('1.234', '0')).toEqual(parse('0.000'));
  expect(mul('-1.234', '0')).toEqual(parse('-0.000'));

  expect(mul('1', '1', { precision: 0 })).toEqual(parse('0e1'));
  expect(mul('1', '1', { precision: 1 })).toEqual(parse('1'));

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

test('multiply empty context', () => {
  const n = parse('123e10');
  const r = n.multiply(2, {});
  expect(r).toEqual(parse('246e10'));
});

test('multiply by zero', () => {
  expect(mul('0', '15.35', { scale: 4 })).toEqual(parse('0e-4'));
  expect(mul('0', '15.35', { precision: 4 })).toEqual(parse('0e-2'));
});

test('multiply with precision', () => {
  expect(mul('10', '.33333', { precision: 0 })).toEqual(parse('0e1'));
  expect(mul('10', '.33333', { precision: 1 })).toEqual(parse('3'));
  expect(mul('10', '.33333', { precision: 2 })).toEqual(parse('3.3'));
  expect(mul('10', '.33333', { precision: 3 })).toEqual(parse('3.33'));
  expect(mul('10', '.33333', { precision: 4 })).toEqual(parse('3.333'));
  expect(mul('10', '.33333', { precision: 5 })).toEqual(parse('3.3333'));
  expect(mul('10', '.33333', { precision: 6 })).toEqual(parse('3.33330'));

  expect(mul('10', '.66666', { precision: 0 })).toEqual(parse('0e1'));
  expect(mul('10', '.66666', { precision: 1 })).toEqual(parse('7'));
  expect(mul('10', '.66666', { precision: 2 })).toEqual(parse('6.7'));
  expect(mul('10', '.66666', { precision: 3 })).toEqual(parse('6.67'));
  expect(mul('10', '.66666', { precision: 4 })).toEqual(parse('6.667'));
  expect(mul('10', '.66666', { precision: 5 })).toEqual(parse('6.6666'));
  expect(mul('10', '.66666', { precision: 6 })).toEqual(parse('6.66660'));

  expect(mul('50', '.33333', { precision: 0 })).toEqual(parse('0e2'));
  expect(mul('50', '.33333', { precision: 1 })).toEqual(parse('2e1'));
  expect(mul('50', '.33333', { precision: 2 })).toEqual(parse('17'));
  expect(mul('50', '.33333', { precision: 3 })).toEqual(parse('16.7'));
  expect(mul('50', '.33333', { precision: 4 })).toEqual(parse('16.67'));
  expect(mul('50', '.33333', { precision: 5 })).toEqual(parse('16.666'));
  expect(mul('50', '.33333', { precision: 6 })).toEqual(parse('16.6665'));
  expect(mul('50', '.33333', { precision: 7 })).toEqual(parse('16.66650'));

  expect(mul('50', '.66666', { precision: 0 })).toEqual(parse('0e2'));
  expect(mul('50', '.66666', { precision: 1 })).toEqual(parse('3e1'));
  expect(mul('50', '.66666', { precision: 2 })).toEqual(parse('33'));
  expect(mul('50', '.66666', { precision: 3 })).toEqual(parse('33.3'));
  expect(mul('50', '.66666', { precision: 4 })).toEqual(parse('33.33'));
  expect(mul('50', '.66666', { precision: 5 })).toEqual(parse('33.333'));
  expect(mul('50', '.66666', { precision: 6 })).toEqual(parse('33.3330'));
  expect(mul('50', '.66666', { precision: 7 })).toEqual(parse('33.33300'));
});

test('multiply with scale', () => {
  expect(mul('10', '.33333', { scale: -1 })).toEqual(parse('0e1'));
  expect(mul('10', '.33333', { scale: 0 })).toEqual(parse('3'));
  expect(mul('10', '.33333', { scale: 1 })).toEqual(parse('3.3'));
  expect(mul('10', '.33333', { scale: 2 })).toEqual(parse('3.33'));
  expect(mul('10', '.33333', { scale: 3 })).toEqual(parse('3.333'));
  expect(mul('10', '.33333', { scale: 4 })).toEqual(parse('3.3333'));
  expect(mul('10', '.33333', { scale: 5 })).toEqual(parse('3.33330'));

  expect(mul('7.3', '4.123', { scale: 4 })).toEqual(parse('30.0979'));
  expect(mul('7.3', '4.123', { scale: 3 })).toEqual(parse('30.098'));
  expect(mul('7.3', '4.123', { scale: 2 })).toEqual(parse('30.10'));
  expect(mul('7.3', '4.123', { scale: 1 })).toEqual(parse('30.1'));

  expect(mul('157', '.2', { scale: 2 })).toEqual(parse('31.40'));
  expect(mul('157', '.2', { scale: 1 })).toEqual(parse('31.4'));
  expect(mul('157', '.2', { scale: 0 })).toEqual(parse('31'));

  expect(mul('157', '.7', { scale: 2 })).toEqual(parse('109.90'));
  expect(mul('157', '.7', { scale: 1 })).toEqual(parse('109.9'));
  expect(mul('157', '.7', { scale: 0 })).toEqual(parse('110'));
  expect(mul('157', '.7', { scale: -1 })).toEqual(parse('11e1'));

  expect(mul('1234567', '10', { scale: -4 })).toEqual(parse('1235e4'));
  expect(mul('1234567', '10', { scale: -3 })).toEqual(parse('12346e3'));
  expect(mul('1234567', '10', { scale: -2 })).toEqual(parse('123457e2'));
  expect(mul('1234567', '10', { scale: -1 })).toEqual(parse('1234567e1'));
  expect(mul('1234567', '10', { scale: 0 })).toEqual(parse('12345670'));
  expect(mul('1234567', '10', { scale: 1 })).toEqual(parse('12345670.0'));
});

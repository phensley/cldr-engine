import { Decimal, DecimalArg, DecimalConstants, Rational } from '../../../src/types/numbers';

const rat = (a: DecimalArg, b: DecimalArg): Rational => new Rational(a, b);
const parse = (s: string) => new Rational(s);

test('parsing', () => {
  let r = new Rational('1 / pi');
  expect(r.numerator()).toEqual(DecimalConstants.ONE);
  expect(r.denominator()).toBe(DecimalConstants.PI);

  r = new Rational('1 / e');
  expect(r.numerator()).toEqual(DecimalConstants.ONE);
  expect(r.denominator()).toBe(DecimalConstants.E);

  r = new Rational('-17.35e-1');
  expect(r.numerator()).toEqual(new Decimal('-17.35e-1'));

  r = rat('1.5', '2.3');
  expect(r.numerator()).toEqual(new Decimal('1.5'));
  expect(r.denominator()).toEqual(new Decimal('2.3'));

  r = new Rational(17);
  expect(r.numerator()).toEqual(new Decimal('17'));
  expect(r.denominator()).toEqual(DecimalConstants.ONE);
});

test('multiplication', () => {
  expect(parse('1 / 5').multiply('2 / 7')).toEqual(parse('2 / 35'));
});

test('divide', () => {
  expect(parse('1 / 5').divide('2 / 7')).toEqual(parse('7 / 10'));
});

test('inverse', () => {
  expect(parse('1 / 5').inverse()).toEqual(parse('5 / 1'));
});

test('compare', () => {
  expect(parse('1 / 5').compare(parse('1 / 5'))).toEqual(0);
  expect(parse('1 / 5').compare(parse('1 / 6'))).toEqual(1);
  expect(parse('.1 / 10').compare(parse('.2 / 10'))).toEqual(-1);

  expect(parse('1 / 5').compare('.1')).toEqual(1);
  expect(parse('1 / 5').compare(0.1)).toEqual(1);
  expect(parse('1 / 5').compare(new Decimal('0.1'))).toEqual(1);

  expect(parse('1 / 20').compare('.1')).toEqual(-1);
  expect(parse('1 / 20').compare(0.1)).toEqual(-1);
  expect(parse('1 / 20').compare(new Decimal('0.1'))).toEqual(-1);
});

test('coerce', () => {
  expect(new Rational(15)).toEqual(parse('15 / 1'));
  expect(new Rational(new Decimal(15))).toEqual(parse('15 / 1'));
  expect(new Rational(new Decimal('15'), new Decimal('3'))).toEqual(parse('15 / 3'));
  expect(new Rational(15, 3)).toEqual(parse('15 / 3'));
});

test('to decimal', () => {
  expect(parse('15 / 3').toDecimal()).toEqual(new Decimal('5'));
});

test('to string', () => {
  expect(parse('15 / 3').toString()).toEqual('15 / 3');
});

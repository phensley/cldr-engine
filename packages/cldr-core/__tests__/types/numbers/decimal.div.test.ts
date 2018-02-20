import { Decimal, RoundingMode, MathContext } from '../../../src/types/numbers';

const parse = (s: string) => new Decimal(s);
const div = (u: string, v: string, c?: MathContext) => parse(u).divide(parse(v), c);
const divmod = (u: string, v: string) => parse(u).divmod(parse(v));

test('divide default', () => {
  expect(div('0', '5')).toEqual(parse('0'));
  expect(div('15', '1')).toEqual(parse('15'));
  expect(div('99999', '10')).toEqual(parse('9999.9'));
  expect(div('99899999001', '999')).toEqual(parse('99999999'));
  expect(div('99799999002', '998')).toEqual(parse('99999999'));

  expect(div('10000000000', '99000000'))
    .toEqual(parse('101.01010101'));

  expect(div('99899999001', '1199999999'))
    .toEqual(parse('83.2499992369'));

  expect(div('9999999999999', '55555555555'))
    .toEqual(parse('180.00000000178'));

  expect(div('9999999999999999999999', '9999999999999999999'))
    .toEqual(parse('1000.0000000000000000999'));
});

test('divide half even', () => {
  const halfEven = (p: number) => new MathContext(p, RoundingMode.HALF_EVEN);

  expect(div('2', '3', halfEven(0))).toEqual(parse('1'));
  expect(div('2', '3', halfEven(1))).toEqual(parse('0.7'));
  expect(div('2', '3', halfEven(2))).toEqual(parse('0.67'));
  expect(div('2', '3', halfEven(3))).toEqual(parse('0.667'));
  expect(div('2', '3', halfEven(5))).toEqual(parse('0.66667'));
  expect(div('2', '3', halfEven(10))).toEqual(parse('0.6666666667'));

  expect(div('10', '3', halfEven(0))).toEqual(parse('0e1'));
  expect(div('10', '3', halfEven(1))).toEqual(parse('3'));
  expect(div('10', '3', halfEven(2))).toEqual(parse('3.3'));
  expect(div('10', '3', halfEven(3))).toEqual(parse('3.33'));
  expect(div('10', '3', halfEven(5))).toEqual(parse('3.3333'));
  expect(div('10', '3', halfEven(10))).toEqual(parse('3.333333333'));

  expect(div('10', '6', halfEven(0))).toEqual(parse('0e1'));
  expect(div('10', '6', halfEven(1))).toEqual(parse('2'));
  expect(div('10', '6', halfEven(2))).toEqual(parse('1.7'));
  expect(div('10', '6', halfEven(3))).toEqual(parse('1.67'));
  expect(div('10', '6', halfEven(5))).toEqual(parse('1.6667'));
  expect(div('10', '6', halfEven(10))).toEqual(parse('1.666666667'));

  expect(div('12', '3', halfEven(0))).toEqual(parse('0e1'));
  expect(div('12', '3', halfEven(1))).toEqual(parse('4'));
  expect(div('12', '3', halfEven(10))).toEqual(parse('4.000000000'));

  expect(div('3', '10', halfEven(0))).toEqual(parse('0'));
  expect(div('3', '10', halfEven(1))).toEqual(parse('0.3'));
  expect(div('3', '10', halfEven(10))).toEqual(parse('.3000000000'));

  expect(div('99999', '10', halfEven(5))).toEqual(parse('9999.9'));
  expect(div('99999', '10', halfEven(10))).toEqual(parse('9999.900000'));
});

test('divide decrements qhat', () => {
  // Cases that cause qhat to be decremented in D3
  expect(div('96441598043416655685', '13367828761276'))
    .toEqual(parse('7214454.9250054136092'));

  expect(div('35314321308673059375', '16403941393069'))
    .toEqual(parse('2152794.89620671778312'));

  expect(div('506806006102288', '46464220541015929'))
    .toEqual(parse('0.0109074466374596544'));
});

test('divide add back', () => {
  // Cases that cause D6 to be executed.
  expect(div('888888888888888888888888888888888888888', '33333333000000420'))
    .toEqual(parse('26666666933332999999993.30667079973345897'));

  expect(div('88888888888888888888888888888888888', '17721038931014481'))
    .toEqual(parse('5016008893999999985.89782878509794418'));

  expect(div('66666666666666666666666666', '69969109701080089'))
    .toEqual(parse('952801414.102279999999919229'));
});

test('divide by zero', () => {
  expect(() => div('123', '0')).toThrowError();
});

test('divmod', () => {
  expect(() => divmod('10', '0')).toThrowError();
  expect(divmod('0', '10')).toEqual([parse('0'), parse('10')]);
  expect(divmod('2', '3')).toEqual([parse('0'), parse('2')]);
  expect(divmod('10', '6')).toEqual([parse('1'), parse('4')]);

  expect(divmod('10', '3')).toEqual([parse('3'), parse('1')]);
  expect(divmod('-10', '3')).toEqual([parse('-3'), parse('-1')]);
  expect(divmod('10', '-3')).toEqual([parse('-3'), parse('1')]);
  expect(divmod('-10', '-3')).toEqual([parse('3'), parse('-1')]);

  expect(divmod('10', '.03')).toEqual([parse('333'), parse('.01')]);
  expect(divmod('10e1', '.03')).toEqual([parse('3333'), parse('.01')]);
  expect(divmod('10e2', '.03')).toEqual([parse('33333'), parse('.01')]);

  expect(divmod('10', '.06')).toEqual([parse('166'), parse('.04')]);
  expect(divmod('10e1', '.06')).toEqual([parse('1666'), parse('.04')]);
  expect(divmod('10e2', '.06')).toEqual([parse('16666'), parse('.04')]);

  expect(divmod('96441598043416655685', '13367828761276'))
    .toEqual([parse('7214454'), parse('12365313972381')]);
});

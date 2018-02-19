import { Decimal, RoundingMode } from '../../../src/types/numbers';

const parse = (s: string) => new Decimal(s);
const div = (u: string, v: string) => parse(u).divide(parse(v));

test('divide', () => {
  expect(div('99999', '10')).toEqual(parse('9999'));
  expect(div('99899999001', '999')).toEqual(parse('99999999'));
  expect(div('99799999002', '998')).toEqual(parse('99999999'));
  expect(div('9999999999999999999999', '9999999999999999999')).toEqual(parse('1000'));

  expect(div('10000000000', '99000000')).toEqual(parse('101'));
  expect(div('99899999001', '1199999999')).toEqual(parse('83'));
  expect(div('9999999999999', '55555555555')).toEqual(parse('180'));

  // TODO:
  // console.log(divide(parsedata('100'), parsedata('99')));
  // console.log(divide(parsedata('100000000'), parsedata('99000000')));
  // console.log(div('123456789', '.1'));
  // console.log(div('123456789', '1'));
  // console.log(div('123456789', '10'));
});

test('divide decrements qhat', () => {
  // Cases that cause qhat to be decremented
  expect(div('96441598043416655685', '13367828761276')).toEqual(parse('7214454'));
  expect(div('35314321308673059375', '16403941393069')).toEqual(parse('2152794'));
});

test('divide add back', () => {
  // Causes D6 to be executed.
  // TODO: Generate more cases
  const u = '88888888888888888888888888888888888888888888888888';
  const v = '333333333333635';
  const w = '266666666666425333333333551739999999';
  expect(div(u, v)).toEqual(parse(w));
});

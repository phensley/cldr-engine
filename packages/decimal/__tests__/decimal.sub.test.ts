import { Decimal } from '../src';

const parse = (n: string) => new Decimal(n);
const sub = (u: string, v: string) => new Decimal(u).subtract(new Decimal(v));

test('subtraction', () => {
  expect(sub('0', '2.5')).toEqual(parse('-2.5'));

  expect(sub('543', '200')).toEqual(parse('343'));
  expect(sub('200', '543')).toEqual(parse('-343'));
  expect(sub('1000000000', '1')).toEqual(parse('999999999'));
  expect(sub('12.3456789', '.020406')).toEqual(parse('12.3252729'));

  expect(sub('-54321', '-321')).toEqual(parse('-54000'));
  expect(sub('-54.0321', '-.0321')).toEqual(parse('-54.0000'));
});

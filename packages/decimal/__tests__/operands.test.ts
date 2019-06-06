import { Decimal } from '../src';

const parse = (s: string) => new Decimal(s);

test('operands', () => {
  expect(parse('0').operands()).toEqual(
    { n: 0, i: 0, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
  );

  expect(parse('0.00').operands()).toEqual(
    { n: 0, i: 0, v: 2, w: 0, f: 0, t: 0, neg: false, dec: true }
  );

  expect(parse('1').operands()).toEqual(
    { n: 1, i: 1, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
  );

  expect(parse('1.0').operands()).toEqual(
    { n: 1, i: 1, v: 1, w: 0, f: 0, t: 0, neg: false, dec: true }
  );

  expect(parse('1e-3').operands()).toEqual(
    { n: 0, i: 0, v: 3, w: 3, f: 1, t: 1, neg: false, dec: true }
  );

  expect(parse('1e2').operands()).toEqual(
    { n: 100, i: 100, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
  );

  expect(parse('123.12').operands()).toEqual(
    { n: 123, i: 123, v: 2, w: 2, f: 12, t: 12, neg: false, dec: true }
  );

  expect(parse('-123.400').operands()).toEqual(
    { n: 123, i: 123, v: 3, w: 1, f: 400, t: 4, neg: true, dec: true }
  );

  expect(parse('-1234567890.12300').operands()).toEqual(
    { n: 1234567890, i: 1234567890, v: 5, w: 3, f: 12300, t: 123, neg: true, dec: true }
  );

  expect(parse('0.1234567890123456789').operands()).toEqual(
    { n: 0, i: 0, v: 19, w: 19, f: 12345678901234, t: 12345678901234, neg: false, dec: true }
  );

  expect(parse('1234567890123456789.12345000').operands()).toEqual(
    { n: 7890123456789, i: 7890123456789, v: 8, w: 5, f: 12345000, t: 12345, neg: false, dec: true }
  );

  expect(parse('1234567e5').operands()).toEqual(
    { n: 123456700000, i: 123456700000, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
  );

  expect(parse('9999999e10').operands()).toEqual(
    { n: 9990000000000, i: 9990000000000, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
  );
});

import { Decimal } from '@phensley/decimal';
import { pluralRules, NumberOperands2 } from '../src';

const operands = (n: string) => {
  const ops = pluralRules.operands(new Decimal(n));
  return Object.keys(ops)
    .map(k => `${k}: ${ops[k as keyof NumberOperands2].toString()}`)
    .join(', ');
};

test('basics', () => {
  let ops: string;

  ops = operands('nan');
  expect(ops).toEqual('n: 0, i: 0, v: 0, w: 0, f: 0, t: 0');

  ops = operands('infinity');
  expect(ops).toEqual('n: 0, i: 0, v: 0, w: 0, f: 0, t: 0');

  ops = operands('-infinity');
  expect(ops).toEqual('n: 0, i: 0, v: 0, w: 0, f: 0, t: 0');

  ops = operands('0');
  expect(ops).toEqual('n: 0, i: 0, v: 0, w: 0, f: 0, t: 0');

  ops = operands('0.00');
  expect(ops).toEqual('n: 0.00, i: 0, v: 2, w: 0, f: 0, t: 0');

  ops = operands('1');
  expect(ops).toEqual('n: 1, i: 1, v: 0, w: 0, f: 0, t: 0');

  ops = operands('1.0');
  expect(ops).toEqual('n: 1.0, i: 1, v: 1, w: 0, f: 0, t: 0');

  ops = operands('1e-3');
  expect(ops).toEqual('n: 0.001, i: 0, v: 3, w: 3, f: 1, t: 1');

  ops = operands('1e2');
  expect(ops).toEqual('n: 100, i: 100, v: 0, w: 0, f: 0, t: 0');

  ops = operands('123.12');
  expect(ops).toEqual('n: 123.12, i: 123, v: 2, w: 2, f: 12, t: 12');

  ops = operands('-123.400');
  expect(ops).toEqual('n: 123.400, i: 123, v: 3, w: 1, f: 400, t: 4');

  ops = operands('-1234567890.12300');
  expect(ops).toEqual('n: 1234567890.12300, i: 1234567890, v: 5, w: 3, f: 12300, t: 123');

  ops = operands('0.1234567890123456789');
  expect(ops).toEqual('n: 0.1234567890123456789, i: 0, v: 19, w: 19, f: 1234567890123456789, t: 1234567890123456789');

  ops = operands('1234567890123456789.12345000');
  expect(ops).toEqual('n: 1234567890123456789.12345000, i: 1234567890123456789, v: 8, w: 5, f: 12345000, t: 12345');

  ops = operands('1234567e5');
  expect(ops).toEqual('n: 123456700000, i: 123456700000, v: 0, w: 0, f: 0, t: 0');

  ops = operands('9999999e10');
  expect(ops).toEqual('n: 99999990000000000, i: 99999990000000000, v: 0, w: 0, f: 0, t: 0');

  ops = operands('-5.23000');
  expect(ops).toEqual('n: 5.23000, i: 5, v: 5, w: 2, f: 23000, t: 23');

  ops = operands('-510.00120');
  expect(ops).toEqual('n: 510.00120, i: 510, v: 5, w: 4, f: 120, t: 12');

  ops = operands('10230.122');
  expect(ops).toEqual('n: 10230.122, i: 10230, v: 3, w: 3, f: 122, t: 122');
});

test('overflow', () => {
  let ops = operands('111222333444555666777888999');
  expect(ops).toEqual(
    'n: 111222333444555666777888999, ' +
    'i: 111222333444555666777888999, ' +
    'v: 0, w: 0, f: 0, t: 0');

  ops = operands('0.111222333444555666777888999');
  expect(ops).toEqual(
    'n: 0.111222333444555666777888999, ' +
    'i: 0, v: 27, w: 27, ' +
    'f: 111222333444555666777888999, ' +
    't: 111222333444555666777888999'
  );

  ops = operands('-99999999999999999999.99999999999999999999');
  expect(ops).toEqual(
    'n: 99999999999999999999.99999999999999999999, ' +
    'i: 99999999999999999999, ' +
    'v: 20, ' +
    'w: 20, ' +
    'f: 99999999999999999999, ' +
    't: 99999999999999999999'
  );
});

// test('operands', () => {

//   expect(DecimalConstants.NAN.operands()).toEqual(
//     { n: 0, i: 0, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false });

//   expect(DecimalConstants.POSITIVE_INFINITY.operands()).toEqual(
//     { n: 0, i: 0, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false });

//   expect(DecimalConstants.NEGATIVE_INFINITY.operands()).toEqual(
//     { n: 0, i: 0, v: 0, w: 0, f: 0, t: 0, neg: true, dec: false });

//   expect(parse('0').operands()).toEqual(
//     { n: 0, i: 0, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
//   );

//   expect(parse('0.00').operands()).toEqual(
//     { n: 0, i: 0, v: 2, w: 0, f: 0, t: 0, neg: false, dec: true }
//   );

//   expect(parse('1').operands()).toEqual(
//     { n: 1, i: 1, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
//   );

//   expect(parse('1.0').operands()).toEqual(
//     { n: 1, i: 1, v: 1, w: 0, f: 0, t: 0, neg: false, dec: true }
//   );

//   expect(parse('1e-3').operands()).toEqual(
//     { n: 0, i: 0, v: 3, w: 3, f: 1, t: 1, neg: false, dec: true }
//   );

//   expect(parse('1e2').operands()).toEqual(
//     { n: 100, i: 100, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
//   );

//   expect(parse('123.12').operands()).toEqual(
//     { n: 123, i: 123, v: 2, w: 2, f: 12, t: 12, neg: false, dec: true }
//   );

//   expect(parse('-123.400').operands()).toEqual(
//     { n: 123, i: 123, v: 3, w: 1, f: 400, t: 4, neg: true, dec: true }
//   );

//   expect(parse('-1234567890.12300').operands()).toEqual(
//     { n: 1234567890, i: 1234567890, v: 5, w: 3, f: 12300, t: 123, neg: true, dec: true }
//   );

//   expect(parse('0.1234567890123456789').operands()).toEqual(
//     { n: 0, i: 0, v: 19, w: 19, f: 12345678901234, t: 12345678901234, neg: false, dec: true }
//   );

//   expect(parse('1234567890123456789.12345000').operands()).toEqual(
//     { n: 7890123456789, i: 7890123456789, v: 8, w: 5, f: 12345000, t: 12345, neg: false, dec: true }
//   );

//   expect(parse('1234567e5').operands()).toEqual(
//     { n: 123456700000, i: 123456700000, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
//   );

//   expect(parse('9999999e10').operands()).toEqual(
//     { n: 99990000000000, i: 99990000000000, v: 0, w: 0, f: 0, t: 0, neg: false, dec: false }
//   );
// });

import { Decimal, DecimalFormat } from '../../../src';

const parse = (s: string) => new Decimal(s);

test('string', () => {
  expect(parse('1.0').toString()).toEqual('1.0');
  expect(parse('1.1').toString()).toEqual('1.1');
  expect(parse('1.01').toString()).toEqual('1.01');
  expect(parse('10.01').toString()).toEqual('10.01');

  expect(parse('.1').toString()).toEqual('0.1');
  expect(parse('.01').toString()).toEqual('0.01');
  expect(parse('.101').toString()).toEqual('0.101');

  expect(parse('.0101010101').toString()).toEqual('0.0101010101');

  expect(parse('100e3').toString()).toEqual('100000');
  expect(parse('10234.012314').toString()).toEqual('10234.012314');
  expect(parse('0.000000456000000000000').toString()).toEqual('0.000000456000000000000');
});

test('format', () => {
  const opts: DecimalFormat = {
    decimal: '.',
    group: ',',
    minusSign: '-',
    minIntDigits: 1,
    minGroupingDigits: 1,
    primaryGroupSize: 3,
    secondaryGroupSize: 4
  };

  expect(parse('.00123').format(opts)).toEqual('0.00123');

  expect(parse('10000').format(opts)).toEqual('10,000');
  expect(parse('100e3').format(opts)).toEqual('100,000');
  expect(parse('1e5').format(opts)).toEqual('100,000');
  expect(parse('1000000e-1').format(opts)).toEqual('100,000.0');

  expect(parse('123456789.1234005').format(opts)).toEqual('12,3456,789.1234005');
  expect(parse('-1234567.001200340').format(opts)).toEqual('-1234,567.001200340');
  expect(parse('-12345678.001200340').format(opts)).toEqual('-1,2345,678.001200340');

  expect(parse('1.23456e5').format(opts)).toEqual('123,456');
  expect(parse('1.23000').format(opts)).toEqual('1.23000');

  expect(parse('123000000000000000000').format(opts))
    .toEqual('12,3000,0000,0000,0000,000');
  expect(parse('123000000000000000000.000000456000000000000').format(opts))
    .toEqual('12,3000,0000,0000,0000,000.000000456000000000000');
});

test('leading integer zeros', () => {
  let opts: DecimalFormat = {
    decimal: '.',
    group: ',',
    minusSign: '-',
    minIntDigits: 5,
    minGroupingDigits: 1,
    primaryGroupSize: 3,
    secondaryGroupSize: -1
  };

  expect(parse('.1').format(opts)).toEqual('00,000.1');
  expect(parse('1').format(opts)).toEqual('00,001');
  expect(parse('12').format(opts)).toEqual('00,012');
  expect(parse('123').format(opts)).toEqual('00,123');
  expect(parse('1234').format(opts)).toEqual('01,234');
  expect(parse('12345').format(opts)).toEqual('12,345');
  expect(parse('123456').format(opts)).toEqual('123,456');

  opts = {
    decimal: '.',
    group: ',',
    minusSign: '-',
    minIntDigits: 0,
    minGroupingDigits: 1,
    primaryGroupSize: 3,
    secondaryGroupSize: -1
  };
  expect(parse('.1').format(opts)).toEqual('.1');
  expect(parse('.0000012345').format(opts)).toEqual('.0000012345');
  expect(parse('1.1').format(opts)).toEqual('1.1');
  expect(parse('1.0000012345').format(opts)).toEqual('1.0000012345');
  expect(parse('123.1').format(opts)).toEqual('123.1');
  expect(parse('123.0000012345').format(opts)).toEqual('123.0000012345');
});

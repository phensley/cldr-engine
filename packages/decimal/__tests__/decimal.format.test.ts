import { Decimal, Part, PartsDecimalFormatter, StringDecimalFormatter } from '../src';

const parse = (s: string) => new Decimal(s);

type FormatArgs = [string, string, number, number, number, number];

const format = (s: string, opts: FormatArgs): string => {
  const n = parse(s);
  const f = new StringDecimalFormatter();
  const [ d, g, mi, mg, pg, sg ] = opts;
  n.format(f, d, g, mi, mg, pg, sg);
  return f.render();
};

const formatParts = (s: string, opts: any[]): Part[] => {
  const n = parse(s);
  const f = new PartsDecimalFormatter(opts[0], opts[1]);
  const [ d, g, mi, mg, pg, sg ] = opts;
  n.format(f, d, g, mi, mg, pg, sg);
  return f.render();
};

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
  const opts: FormatArgs = ['.', ',', 1, 1, 3, 4];
  expect(format('.00123', opts)).toEqual('0.00123');
  expect(format('.00123', opts)).toEqual('0.00123');

  expect(format('10000', opts)).toEqual('10,000');
  expect(format('100e3', opts)).toEqual('100,000');
  expect(format('1e5', opts)).toEqual('100,000');
  expect(format('1000000e-1', opts)).toEqual('100,000.0');

  expect(format('123456789.1234005', opts)).toEqual('12,3456,789.1234005');
  expect(format('1234567.001200340', opts)).toEqual('1234,567.001200340');
  expect(format('12345678.001200340', opts)).toEqual('1,2345,678.001200340');

  expect(format('1.23456e5', opts)).toEqual('123,456');
  expect(format('1.23000', opts)).toEqual('1.23000');

  expect(format('123000000000000000000', opts))
    .toEqual('12,3000,0000,0000,0000,000');
  expect(format('123000000000000000000.000000456000000000000', opts))
    .toEqual('12,3000,0000,0000,0000,000.000000456000000000000');
});

test('leading integer zeros', () => {
  let opts: FormatArgs = ['.', ',', 5, 1, 3, -1];
  expect(format('0', opts)).toEqual('00,000');
  expect(format('0.0', opts)).toEqual('00,000');
  expect(format('0e10', opts)).toEqual('00,000');
  expect(format('.1', opts)).toEqual('00,000.1');
  expect(format('1', opts)).toEqual('00,001');
  expect(format('12', opts)).toEqual('00,012');
  expect(format('123', opts)).toEqual('00,123');
  expect(format('1234', opts)).toEqual('01,234');
  expect(format('12345', opts)).toEqual('12,345');
  expect(format('123456', opts)).toEqual('123,456');

  opts = ['.', ',', 0, 1, 3, -1];
  expect(format('.1', opts)).toEqual('.1');
  expect(format('.0000012345', opts)).toEqual('.0000012345');
  expect(format('1.1', opts)).toEqual('1.1');
  expect(format('1.0000012345', opts)).toEqual('1.0000012345');
  expect(format('123.1', opts)).toEqual('123.1');
  expect(format('123.0000012345', opts)).toEqual('123.0000012345');
});

test('format parts', () => {
  const opts = ['.', ',', 1, 1, 3, -1];
  expect(formatParts('12345.12300', opts)).toEqual([
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '12300' }
  ]);
});

import { Decimal } from '../src';

const sci = (d: string, m?: number) =>
  new Decimal(d).toScientificString(m);

const scip = (d: string, m?: number) =>
  new Decimal(d).toScientificParts(m);

test('scientific string', () => {
  expect(sci('0')).toEqual('0');
  expect(sci('0.0')).toEqual('0');
  expect(sci('1.0')).toEqual('1.0');
  expect(sci('1.01')).toEqual('1.01');
  expect(sci('10.01')).toEqual('1.001E+1');
  expect(sci('0.000123')).toEqual('1.23E-4');
  expect(sci('12345678')).toEqual('1.2345678E+7');
  expect(sci('1234.5678')).toEqual('1.2345678E+3');

  expect(sci('0', 2)).toEqual('00');
  expect(sci('1', 2)).toEqual('10E-1');
  expect(sci('123', 2)).toEqual('12.3E+1');
  expect(sci('12345.678', 2)).toEqual('12.345678E+3');
});

test('scientific parts', () => {
  expect(scip('0')).toEqual([
    { type: 'integer', value: '0' }
  ]);

  expect(scip('123', 2)).toEqual([
    { type: 'integer', value: '12' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '3' },
    { type: 'exp', value: 'E' },
    { type: 'plus', value: '+' },
    { type: 'integer', value: '1' }
  ]);

  expect(scip('-123.57', 2)).toEqual([
    { type: 'minus', value: '-' },
    { type: 'integer', value: '12' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '357' },
    { type: 'exp', value: 'E' },
    { type: 'plus', value: '+' },
    { type: 'integer', value: '1' }
  ]);

  expect(scip('0.0012')).toEqual([
    { type: 'integer', value: '1' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '2' },
    { type: 'exp', value: 'E' },
    { type: 'minus', value: '-' },
    { type: 'integer', value: '3' }
  ]);
});

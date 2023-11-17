import { numbersApi } from '../../_helpers';
import { DecimalFormatOptions, DecimalFormatStyleType, NumbersImpl, Part } from '../../../src';

test('format', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('9999');
  expect(s).toEqual('9,999');

  s = api.formatDecimal('9999.999');
  expect(s).toEqual('9,999.999');

  s = api.formatDecimal('9999.9999');
  expect(s).toEqual('10,000');
});

test('zeros', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('0');
  expect(s).toEqual('0');

  s = api.formatDecimal('-0.00');
  expect(s).toEqual('0');

  s = api.formatDecimal('-0.00', { negativeZero: true });
  expect(s).toEqual('-0');

  s = api.formatDecimal('0', { minimumFractionDigits: 2 });
  expect(s).toEqual('0.00');

  s = api.formatDecimal('-0.00', { minimumFractionDigits: 2 });
  expect(s).toEqual('0.00');

  s = api.formatDecimal('-0.00', { minimumFractionDigits: 2, negativeZero: true });
  expect(s).toEqual('-0.00');
});

test('decimals unknown style', () => {
  const opts: DecimalFormatOptions = { style: 'UNKNOWN' as DecimalFormatStyleType };
  const api = numbersApi('en');

  const s = api.formatDecimal('1000000000', opts);
  expect(s).toEqual('');
});

test('nan or infinity', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal(NaN, {});
  expect(s).toEqual('NaN');

  s = api.formatDecimal(NaN, { errors: [] });
  expect(s).toEqual('NaN');

  s = api.formatDecimal(NaN, { errors: ['infinity'] });
  expect(s).toEqual('NaN');

  expect(() => api.formatDecimal(NaN, { errors: ['nan'] })).toThrowError();

  s = api.formatDecimal(Infinity, {});
  expect(s).toEqual('∞');

  s = api.formatDecimal(Infinity, { errors: [] });
  expect(s).toEqual('∞');

  s = api.formatDecimal(Infinity, { errors: ['nan'] });
  expect(s).toEqual('∞');

  expect(() => api.formatDecimal(Infinity, { errors: ['infinity'] })).toThrowError();

  s = api.formatDecimal(12.345, { errors: ['nan', 'infinity'] });
  expect(s).toEqual('12.345');
});

test('minimum grouping digits', () => {
  const api = numbersApi('pl');
  let s: string;

  s = api.formatDecimal('9999', { group: true });
  expect(s).toEqual('9999');

  s = api.formatDecimal('11111', { group: true });
  expect(s).toEqual('11\u00a0111');
});

test('decimals short', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('1000000000', { style: 'short' });
  expect(s).toEqual('1B');

  s = api.formatDecimal('1000000000000', { style: 'short' });
  expect(s).toEqual('1T');

  s = api.formatDecimal('10000000000000', { style: 'short' });
  expect(s).toEqual('10T');

  s = api.formatDecimal('100000000000000', { style: 'short' });
  expect(s).toEqual('100T');

  s = api.formatDecimal('1000000000000000', { style: 'short', group: true });
  expect(s).toEqual('1,000T');

  s = api.formatDecimal('10000000000000000', { style: 'short', group: true });
  expect(s).toEqual('10,000T');
});

test('decimals short fractions', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('1.234567', { style: 'short' });
  expect(s).toEqual('1.2');

  s = api.formatDecimal('12.34567', { style: 'short' });
  expect(s).toEqual('12');

  s = api.formatDecimal('123.4567', { style: 'short' });
  expect(s).toEqual('123');

  s = api.formatDecimal('1234.567', { style: 'short' });
  expect(s).toEqual('1.2K');

  s = api.formatDecimal('1.234567', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('1.2');

  s = api.formatDecimal('12.34567', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('12.3');

  s = api.formatDecimal('123.4567', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('123.5');

  s = api.formatDecimal('1234.567', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('1.2K');

  s = api.formatDecimal('1.234567', { style: 'short', minimumFractionDigits: 2 });
  expect(s).toEqual('1.23');

  s = api.formatDecimal('12.34567', { style: 'short', minimumFractionDigits: 2 });
  expect(s).toEqual('12.35');

  s = api.formatDecimal('123.4567', { style: 'short', minimumFractionDigits: 2 });
  expect(s).toEqual('123.46');

  s = api.formatDecimal('1234.567', { style: 'short', minimumFractionDigits: 2 });
  expect(s).toEqual('1.23K');
});

test('decimals long', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('1000000000', { style: 'long' });
  expect(s).toEqual('1 billion');

  s = api.formatDecimal('1000000000000', { style: 'long' });
  expect(s).toEqual('1 trillion');

  s = api.formatDecimal('10000000000000', { style: 'long' });
  expect(s).toEqual('10 trillion');

  s = api.formatDecimal('100000000000000', { style: 'long' });
  expect(s).toEqual('100 trillion');

  s = api.formatDecimal('1000000000000000', { style: 'long', group: true });
  expect(s).toEqual('1,000 trillion');

  s = api.formatDecimal('10000000000000000', { style: 'long', group: true });
  expect(s).toEqual('10,000 trillion');
});

test('compact non-latn', () => {
  let api: NumbersImpl;
  let s: string;

  // Compact number formatting for zh-Hant-HK "long" changed in CLDR 44
  // to be equal to "short"
  api = numbersApi('zh-HK');
  s = api.formatDecimal('1000000000', { style: 'long' });
  expect(s).toEqual('1B');

  s = api.formatDecimal('1000000000', { style: 'short' });
  expect(s).toEqual('1B');

  api = numbersApi('km');
  s = api.formatDecimal('1000000000', { style: 'long' });
  expect(s).toEqual('1 ប៊ីលាន');

  s = api.formatDecimal('1000000000', { style: 'short' });
  expect(s).toEqual('1 ប៊ីលាន');

  api = numbersApi('ta-LK');
  s = api.formatDecimal('1000000000', { style: 'long' });
  expect(s).toEqual('1 பில்லியன்');

  s = api.formatDecimal('1000000000', { style: 'short' });
  expect(s).toEqual('1பி');
});

test('scientific non-latn', () => {
  let api: NumbersImpl;
  let s: string;

  api = numbersApi('zh-HK');
  s = api.formatDecimal('1000000000', { style: 'scientific' });
  expect(s).toEqual('1E+9');

  s = api.formatDecimal('1000000000', { style: 'scientific', nu: 'beng' });
  expect(s).toEqual('১E+৯');

  s = api.formatDecimal('1000000000', { style: 'scientific', nu: 'beng', minimumIntegerDigits: 0 });
  expect(s).toEqual('১E+৯');
});

test('significant digits', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('100599.99', { maximumSignificantDigits: 3, round: 'half-even' });
  expect(s).toEqual('101,000');

  s = api.formatDecimal('101599.99', { maximumSignificantDigits: 3, round: 'half-even' });
  expect(s).toEqual('102,000');
});

test('negative zero', () => {
  const api = numbersApi('en');
  const opts: DecimalFormatOptions = { style: 'long', maximumFractionDigits: 0, round: 'ceiling' };
  let s: string;

  s = api.formatDecimal('-0.999', opts);
  expect(s).toEqual('0');

  s = api.formatDecimal('-0.999', { ...opts, negativeZero: true });
  expect(s).toEqual('-0');
});

test('decimal compact', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('12345.234', { style: 'short' });
  expect(s).toEqual('12K');

  s = api.formatDecimal('12345.234', { style: 'long' });
  expect(s).toEqual('12 thousand');

  s = api.formatDecimal('0.999', { style: 'long' });
  expect(s).toEqual('1');

  s = api.formatDecimal('-0.999', { style: 'long' });
  expect(s).toEqual('-1');

  s = api.formatDecimal('-0.999', { style: 'long', maximumFractionDigits: 1, round: 'ceiling' });
  expect(s).toEqual('-0.9');

  s = api.formatDecimal('-0.999', { style: 'long', maximumFractionDigits: 0, round: 'ceiling' });
  expect(s).toEqual('0');

  s = api.formatDecimal('12345.6789', { style: 'short', maximumFractionDigits: 2 });
  expect(s).toEqual('12.35K');

  s = api.formatDecimal('45.6789', { style: 'short', maximumFractionDigits: 2 });
  expect(s).toEqual('45.68');

  s = api.formatDecimal('3456789123456789', { style: 'long', group: true, minimumFractionDigits: 1 });
  expect(s).toEqual('3,456.8 trillion');

  s = api.formatDecimal('3456789123456789', { style: 'long', group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('3,456.8 trillion');

  s = api.formatDecimal('3456789123456789', { style: 'long', group: true, minimumSignificantDigits: 2 });
  expect(s).toEqual('3,457 trillion');

  s = api.formatDecimal('3456789123456789', { style: 'long', group: true, maximumSignificantDigits: 3 });
  expect(s).toEqual('3,460 trillion');

  s = api.formatDecimal('999.99', { style: 'long', group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('1 thousand');

  s = api.formatDecimal('0.999', { style: 'short' });
  expect(s).toEqual('1');

  s = api.formatDecimal('999.99', { style: 'short' });
  expect(s).toEqual('1K');

  s = api.formatDecimal('999999.99', { style: 'short' });
  expect(s).toEqual('1M');

  s = api.formatDecimal('199999.99', { style: 'short' });
  expect(s).toEqual('200K');

  s = api.formatDecimal('199999.99', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('200.0K');

  s = api.formatDecimal('199999.99', { style: 'short', maximumFractionDigits: 0 });
  expect(s).toEqual('200K');

  s = api.formatDecimal('289300', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('289.3K');

  s = api.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('12,345.7');

  s = api.formatDecimal('12345.67811111', { group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('12,345.7');
});

test('decimal compact significant digits', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('1200', { style: 'short' });
  expect(s).toEqual('1.2K');

  s = api.formatDecimal('1000000000', { style: 'short' });
  expect(s).toEqual('1B');

  s = api.formatDecimal('1000000000', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('1.0B');

  s = api.formatDecimal('1500000000', { style: 'short' });
  expect(s).toEqual('1.5B');

  s = api.formatDecimal('1500000000', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('1.5B');

  s = api.formatDecimal('1590000000', { style: 'short' });
  expect(s).toEqual('1.6B');

  s = api.formatDecimal('1590000000', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('1.6B');

  s = api.formatDecimal('1590000000', { style: 'short', minimumFractionDigits: 2 });
  expect(s).toEqual('1.59B');

  s = api.formatDecimal('12345', { style: 'short' });
  expect(s).toEqual('12K');

  s = api.formatDecimal('12345', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('12.3K');
});

test('decimal percents', () => {
  const api = numbersApi('en');

  let s = api.formatDecimal('1.234', { style: 'percent' });
  expect(s).toEqual('123%');

  s = api.formatDecimal('1.234', { style: 'percent', minimumFractionDigits: 1 });
  expect(s).toEqual('123.4%');

  s = api.formatDecimal('1.234', { style: 'percent-scaled' });
  expect(s).toEqual('1%');

  s = api.formatDecimal('1.234', { style: 'percent-scaled', minimumFractionDigits: 2 });
  expect(s).toEqual('1.23%');

  s = api.formatDecimal('-1.234', { style: 'permille' });
  expect(s).toEqual('-1,234‰');

  s = api.formatDecimal('-1.234', { style: 'permille-scaled' });
  expect(s).toEqual('-1‰');
});

test('decimal rounding', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('0.998', { round: 'floor', maximumFractionDigits: 0 });
  expect(s).toEqual('0');

  s = api.formatDecimal('0.998', { round: 'floor', maximumFractionDigits: 2 });
  expect(s).toEqual('0.99');

  s = api.formatDecimal('0.998', { round: 'floor', maximumFractionDigits: 3 });
  expect(s).toEqual('0.998');

  s = api.formatDecimal('1.998', { round: 'floor', maximumFractionDigits: 0 });
  expect(s).toEqual('1');

  s = api.formatDecimal('1.998', { round: 'floor', maximumFractionDigits: 2 });
  expect(s).toEqual('1.99');

  s = api.formatDecimal('1.998', { round: 'floor', maximumFractionDigits: 3 });
  expect(s).toEqual('1.998');

  s = api.formatDecimal('-0.998', { round: 'ceiling', maximumFractionDigits: 0 });
  expect(s).toEqual('0');

  s = api.formatDecimal('-0.998', { round: 'ceiling', maximumFractionDigits: 2 });
  expect(s).toEqual('-0.99');

  s = api.formatDecimal('-0.998', { round: 'ceiling', maximumFractionDigits: 3 });
  expect(s).toEqual('-0.998');

  s = api.formatDecimal('-1.998', { round: 'ceiling', maximumFractionDigits: 0 });
  expect(s).toEqual('-1');

  s = api.formatDecimal('-1.998', { round: 'ceiling', maximumFractionDigits: 2 });
  expect(s).toEqual('-1.99');

  s = api.formatDecimal('-1.998', { round: 'ceiling', maximumFractionDigits: 3 });
  expect(s).toEqual('-1.998');
});

test('decimal parts', () => {
  const opts: DecimalFormatOptions = { group: true };
  const api = numbersApi('en');
  let p = api.formatDecimalToParts('12345.1234', opts);

  expect(p).toEqual([
    { type: 'integer', value: '12' },
    { type: 'group', value: ',' },
    { type: 'integer', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '123' },
  ]);

  opts.style = 'percent';
  p = api.formatDecimalToParts('-1.234', opts);
  expect(p).toEqual([
    { type: 'minus', value: '-' },
    { type: 'integer', value: '123' },
    { type: 'percent', value: '%' },
  ]);

  p = api.formatDecimalToParts('9999.999');
  expect(p).toEqual([
    { type: 'integer', value: '9' },
    { type: 'group', value: ',' },
    { type: 'integer', value: '999' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '999' },
  ]);

  p = api.formatDecimalToParts('9999.9999');
  expect(p).toEqual([
    { type: 'integer', value: '10' },
    { type: 'group', value: ',' },
    { type: 'integer', value: '000' },
  ]);
});

test('decimal scientific parts', () => {
  const api = numbersApi('en');
  let p: Part[];

  p = api.formatDecimalToParts('5', { style: 'scientific' });
  expect(p).toEqual([{ type: 'integer', value: '5' }]);

  p = api.formatDecimalToParts('5', { style: 'scientific', minimumSignificantDigits: 2 });
  expect(p).toEqual([
    { type: 'integer', value: '5' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '0' },
  ]);

  p = api.formatDecimalToParts('123.456', { style: 'scientific', minimumSignificantDigits: 3 });
  expect(p).toEqual([
    { type: 'integer', value: '1' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '23' },
    { type: 'exponent', value: 'E' },
    { type: 'plus', value: '+' },
    { type: 'integer', value: '2' },
  ]);

  p = api.formatDecimalToParts('21', { style: 'scientific', minimumSignificantDigits: 2 });
  expect(p).toEqual([
    { type: 'integer', value: '2' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '1' },
    { type: 'exponent', value: 'E' },
    { type: 'plus', value: '+' },
    { type: 'integer', value: '1' },
  ]);

  p = api.formatDecimalToParts('1578000', { style: 'scientific', minimumSignificantDigits: 2 });
  expect(p).toEqual([
    { type: 'integer', value: '1' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '6' },
    { type: 'exponent', value: 'E' },
    { type: 'plus', value: '+' },
    { type: 'integer', value: '6' },
  ]);

  p = api.formatDecimalToParts('-1.234567', { style: 'scientific', minimumSignificantDigits: 4 });
  expect(p).toEqual([
    { type: 'minus', value: '-' },
    { type: 'integer', value: '1' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '235' },
  ]);

  p = api.formatDecimalToParts('-0.00012345', { style: 'scientific', minimumSignificantDigits: 3 });
  expect(p).toEqual([
    { type: 'minus', value: '-' },
    { type: 'integer', value: '1' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '23' },
    { type: 'exponent', value: 'E' },
    { type: 'minus', value: '-' },
    { type: 'integer', value: '4' },
  ]);
});

test('decimal invalid', () => {
  const opts: DecimalFormatOptions = { style: 'invalid' as DecimalFormatStyleType };
  const api = numbersApi('en');
  const s = api.formatDecimal('12345.1234', opts);
  expect(s).toEqual('');
});

test('v39 es-419 grouping digits', () => {
  const api = numbersApi('es-419');
  let s: string;

  // Pre-v39 grouping digits was 2, would format as '1000'
  s = api.formatDecimal('1000');
  expect(s).toEqual('1,000');
});

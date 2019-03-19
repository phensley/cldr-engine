import { languageBundle } from '../../_helpers';
import {
  Decimal,
  DecimalFormatOptions,
  DecimalFormatStyleType,
  InternalsImpl,
  NumbersImpl,
  PrivateApiImpl
} from '../../../src';

const INTERNALS = new InternalsImpl();

const numbersApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new NumbersImpl(bundle, INTERNALS, new PrivateApiImpl(bundle, INTERNALS));
};

test('format', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('9999');
  expect(s).toEqual('9999');

  s = api.formatDecimal('9999.999');
  expect(s).toEqual('9999.999');

  s = api.formatDecimal('9999.9999');
  expect(s).toEqual('10000');
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

test('significant digits', () => {
  const api = numbersApi('en');
  let s: string;

  const d = new Decimal('100599.99');

  s = api.formatDecimal('100599.99', { maximumSignificantDigits: 3, round: 'half-even' });
  expect(s).toEqual('101000');

  s = api.formatDecimal('101599.99', { maximumSignificantDigits: 3, round: 'half-even' });
  expect(s).toEqual('102000');
});

test('decimal compact', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('12345.234',  { style: 'short' });
  expect(s).toEqual('12K');

  s = api.formatDecimal('12345.234',  { style: 'long' });
  expect(s).toEqual('12 thousand');

  s = api.formatDecimal('0.999', { style: 'long' });
  expect(s).toEqual('1');

  s = api.formatDecimal('-0.999',  { style: 'long' });
  expect(s).toEqual('-1');

  s = api.formatDecimal('-0.999',  { style: 'long', maximumFractionDigits: 1, round: 'ceiling' });
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

  s = api.formatDecimal('3456789123456789',
    { style: 'long', group: true, maximumSignificantDigits: 3});
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

  s = api.formatDecimal('1590000000', { style: 'short' });
  expect(s).toEqual('1.6B');

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
  expect(s).toEqual('-1234‰');

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
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '123' }
  ]);

  opts.style = 'percent';
  p = api.formatDecimalToParts('-1.234', opts);
  expect(p).toEqual([
    { type: 'minus', value: '-' },
    { type: 'digits', value: '123' },
    { type: 'percent', value: '%' }
  ]);

  p = api.formatDecimalToParts('9999.999');
  expect(p).toEqual([
    { type: 'digits', value: '9999' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '999' }
  ]);

  p = api.formatDecimalToParts('9999.9999');
  expect(p).toEqual([
    { type: 'digits', value: '10000' }
  ]);
});

test('decimal invalid', () => {
  const opts: DecimalFormatOptions = { style: 'invalid' as DecimalFormatStyleType };
  const api = numbersApi('en');
  const s = api.formatDecimal('12345.1234', opts);
  expect(s).toEqual('');
});

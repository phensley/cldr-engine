import { ContextType, CurrencyType } from '@phensley/cldr-types';
import { Part } from '@phensley/decimal';

import { numbersApi } from '../../_helpers';
import { CurrencyFormatOptions, CurrencyFormatStyleType } from '../../../src';

test('currency fractions', () => {
  const api = numbersApi('en');
  expect(api.getCurrencyFractions('USD').digits).toEqual(2);
  expect(api.getCurrencyFractions('JPY').digits).toEqual(0);
});

test('currency regions', () => {
  const api = numbersApi('en');
  expect(api.getCurrencyForRegion('')).toEqual('USD');
  expect(api.getCurrencyForRegion('ZZ')).toEqual('USD');
  expect(api.getCurrencyForRegion('US')).toEqual('USD');
  expect(api.getCurrencyForRegion('AC')).toEqual('SHP');
  expect(api.getCurrencyForRegion('AR')).toEqual('ARS');
  expect(api.getCurrencyForRegion('EE')).toEqual('EUR');
});

test('plural unit wrapper fallback', () => {
  const api = numbersApi('so');
  let actual: string;

  actual = api.formatCurrency('1', 'GBP', { style: 'code' });
  expect(actual).toEqual('1.00 GBP');
});

test('currency nan and infinity', () => {
  const api = numbersApi('en');

  expect(() => api.formatCurrency(NaN, 'USD')).toThrowError();
  expect(() => api.formatCurrency(Infinity, 'USD')).toThrowError();
});

test('currency unknown style', () => {
  const opts: CurrencyFormatOptions = { style: 'UNKNOWN' as CurrencyFormatStyleType };
  const api = numbersApi('en');
  let actual: string;

  actual = api.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('');
});

test('minimum grouping digits', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  const api = numbersApi('es-ES');
  let s: string;

  s = api.formatCurrency('1234.567', 'EUR', opts);
  expect(s).toEqual('1234,57 €');
});

test('zero currency', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  const api = numbersApi('en');
  let s: string;

  s = api.formatCurrency('0', 'USD', opts);
  expect(s).toEqual('$0.00');

  s = api.formatCurrency('0', 'JPY', opts);
  expect(s).toEqual('¥0');
});

test('currency', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  const api = numbersApi('en');
  let s: string;

  s = api.formatCurrency('0', 'USD', opts);
  expect(s).toEqual('$0.00');

  s = api.formatCurrency('-1', 'USD', opts);
  expect(s).toEqual('-$1.00');

  s = api.formatCurrency('12345.234', 'USD', opts);
  expect(s).toEqual('$12,345.23');

  opts.maximumFractionDigits = 0;
  s = api.formatCurrency('1.567', 'USD', opts);
  expect(s).toEqual('$2');
});

test('v38 currencies', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', symbolWidth: 'narrow', group: true };
  const api = numbersApi('en');
  let s: string;

  s = api.formatCurrency('0', 'AZN', opts);
  expect(s).toEqual('₼0.00');
});

test('currency accounting', () => {
  const opts: CurrencyFormatOptions = { style: 'accounting', group: true };
  let api = numbersApi('en');
  let s: string;

  s = api.formatCurrency('-12345.6789', 'EUR', { group: false });
  expect(s).toEqual('-€12345.68');

  s = api.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('(€12,345.68)');

  s = api.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('(£12,345.68)');

  s = api.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('(¥12,346)');

  api = numbersApi('de');
  s = api.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-12.345,68 €');

  s = api.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-12.345,68 £');

  s = api.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-12.346 ¥');

  api = numbersApi('es-419');
  s = api.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-EUR 12,345.68');

  s = api.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-GBP 12,345.68');

  s = api.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-JPY 12,346');
});

test('currency name', () => {
  const opts: CurrencyFormatOptions = { style: 'name', group: true };
  let api = numbersApi('en');
  let s: string;

  s = api.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-12,345.68 euros');

  s = api.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-12,345.68 British pounds');

  s = api.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-12,346 Japanese yen');

  api = numbersApi('de');
  s = api.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-12.345,68 Euro');

  s = api.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-12.345,68 Britische Pfund');

  s = api.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-12.346 Japanische Yen');

  api = numbersApi('es-419');
  s = api.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-12,345.68 euros');

  s = api.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-12,345.68 libras esterlinas');

  s = api.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-12,346 yenes japoneses');
});

test('currency short', () => {
  let opts: CurrencyFormatOptions = { style: 'short', group: true };
  let e = numbersApi('en');
  let s: string;

  s = e.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-€12K');

  s = e.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-£12K');

  s = e.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-¥12K');

  s = e.formatCurrency('0.9999', 'USD', opts);
  expect(s).toEqual('$1');

  s = e.formatCurrency('123.4567', 'USD', opts);
  expect(s).toEqual('$123');

  s = e.formatCurrency('999.9', 'USD', opts);
  expect(s).toEqual('$1K');

  s = e.formatCurrency('999999.9', 'USD', opts);
  expect(s).toEqual('$1M');

  s = e.formatCurrency('999900.00', 'USD', opts);
  expect(s).toEqual('$1M');

  s = e.formatCurrency('999000.00', 'USD', opts);
  expect(s).toEqual('$999K');

  opts.maximumFractionDigits = 1;
  s = e.formatCurrency('999900.00', 'USD', opts);
  expect(s).toEqual('$999.9K');

  opts.maximumFractionDigits = 0;
  s = e.formatCurrency('999900.00', 'USD', opts);
  expect(s).toEqual('$1M');

  opts = { style: 'short', group: true };
  e = numbersApi('de');
  s = e.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-12.346 €');

  s = e.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-12.346 £');

  s = e.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-12.346 ¥');

  e = numbersApi('es-419');
  s = e.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-EUR 12 K');

  s = e.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-GBP 12 K');

  s = e.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-JPY 12 K');

  e = numbersApi('zh');
  s = e.formatCurrency('999999.987', 'USD', opts);
  // TODO: support algorithmic numbering for chinese finance
  expect(s).toEqual('US$100万');
});

test('currency fractions', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol' };
  const api = numbersApi('en');
  let s: string;

  s = api.formatCurrency('12345.019999', 'JPY', opts);
  expect(s).toEqual('¥12,345');

  opts.minimumFractionDigits = 2;
  s = api.formatCurrency('12345.019999', 'JPY', opts);
  expect(s).toEqual('¥12,345.02');
});

test('currency spacing', () => {
  let api = numbersApi('en');
  let opts: CurrencyFormatOptions;
  let s: string;

  opts = { style: 'symbol', group: true };
  s = api.formatCurrency('12345.234', 'BAD', opts);
  expect(s).toEqual('BAD\u00a012,345.23');

  s = api.formatCurrency('12345.234', 'AUD', opts);
  expect(s).toEqual('A$12,345.23');

  opts.symbolWidth = 'narrow';
  s = api.formatCurrency('12345.234', 'AUD', opts);
  expect(s).toEqual('$12,345.23');

  api = numbersApi('de');
  opts.symbolWidth = 'default';

  s = api.formatCurrency('12345.234', 'BAD', opts);
  expect(s).toEqual('12.345,23\u00a0BAD');

  s = api.formatCurrency('12345.234', 'USD', opts);
  expect(s).toEqual('12.345,23\u00a0$');

  api = numbersApi('km');
  s = api.formatCurrency('12345.234', 'USD', opts);
  expect(s).toEqual('12,345.23$');

  opts = { style: 'symbol', symbolWidth: 'default', group: true, nu: 'native' };
  s = api.formatCurrency('12345.234', 'USD', opts);
  expect(s).toEqual('១២.៣៤៥,២៣$');

  s = api.formatCurrency('12345.234', 'BAD', opts);
  expect(s).toEqual('១២.៣៤៥,២៣\u00a0BAD');
});

test('currency parts', () => {
  const api = numbersApi('en');
  let p: Part[];

  p = api.formatCurrencyToParts('12345.234', 'USD');
  expect(p).toEqual([
    { type: 'currency', value: '$' },
    { type: 'integer', value: '12' },
    { type: 'group', value: ',' },
    { type: 'integer', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '23' },
  ]);

  const opts: CurrencyFormatOptions = { style: 'accounting', group: true };
  p = api.formatCurrencyToParts('12345.234', 'USD', opts);
  expect(p).toEqual([
    { type: 'currency', value: '$' },
    { type: 'integer', value: '12' },
    { type: 'group', value: ',' },
    { type: 'integer', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '23' },
  ]);

  opts.style = 'code';
  p = api.formatCurrencyToParts('1002123.0166', 'AUD', opts);
  expect(p).toEqual([
    { type: 'integer', value: '1' },
    { type: 'group', value: ',' },
    { type: 'integer', value: '002' },
    { type: 'group', value: ',' },
    { type: 'integer', value: '123' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '02' },
    { type: 'literal', value: ' ' },
    { type: 'unit', value: 'AUD' },
  ]);

  opts.style = 'short';
  p = api.formatCurrencyToParts('123456789.123', 'EUR', opts);
  expect(p).toEqual([
    { type: 'currency', value: '€' },
    { type: 'integer', value: '123' },
    { type: 'literal', value: 'M' },
  ]);
});

test('currency parts spacing', () => {
  let api = numbersApi('en');
  let s: Part[];

  s = api.formatCurrencyToParts('12345.234', 'BAD', { group: true });
  expect(s).toEqual([
    { type: 'currency', value: 'BAD' },
    { type: 'spacer', value: '\u00a0' },
    { type: 'integer', value: '12' },
    { type: 'group', value: ',' },
    { type: 'integer', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '23' },
  ]);

  api = numbersApi('km');
  s = api.formatCurrencyToParts('12345.234', 'BAD', { group: true, nu: 'native' });
  expect(s).toEqual([
    { type: 'integer', value: '១២' },
    { type: 'group', value: '.' },
    { type: 'integer', value: '៣៤៥' },
    { type: 'decimal', value: ',' },
    { type: 'fraction', value: '២៣' },
    { type: 'spacer', value: '\u00a0' },
    { type: 'currency', value: 'BAD' },
  ]);

  s = api.formatCurrencyToParts('12345.234', 'BAD', { group: true });
  expect(s).toEqual([
    { type: 'integer', value: '12' },
    { type: 'group', value: ',' },
    { type: 'integer', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'fraction', value: '23' },
    { type: 'spacer', value: '\u00a0' },
    { type: 'currency', value: 'BAD' },
  ]);
});

// TODO: should unknown currency throw error or return empty
// test('currency parts unknown', () => {
//   const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
//   let engine = new NumbersApiImpl(INTERNAL, EN);
//   let actual: Part[];

//   actual = engine.formatCurrencyParts('12345.234', 'XXQ' as CurrencyType, opts);
//   expect(actual).toEqual([]);
// });

test('currency symbols', () => {
  const api = numbersApi('en');

  let s = api.getCurrencySymbol('USD');
  expect(s).toEqual('$');

  s = api.getCurrencySymbol('USD', 'narrow');
  expect(s).toEqual('$');

  s = api.getCurrencySymbol('AUD');
  expect(s).toEqual('A$');

  s = api.getCurrencySymbol('AUD', 'narrow');
  expect(s).toEqual('$');

  s = api.getCurrencySymbol('BAD');
  expect(s).toEqual('BAD');

  s = api.getCurrencySymbol('BAD', 'narrow');
  expect(s).toEqual('BAD');

  s = api.getCurrencySymbol('UNKNOWN' as CurrencyType);
  expect(s).toEqual('');
});

test('currency display names', () => {
  let api = numbersApi('en');
  let s: string;

  s = api.getCurrencyDisplayName('USD');
  expect(s).toEqual('US Dollar');

  s = api.getCurrencyDisplayName('USD', {});
  expect(s).toEqual('US Dollar');

  api = numbersApi('en-GB');
  s = api.getCurrencyDisplayName('USD');
  expect(s).toEqual('US Dollar');

  api = numbersApi('es');
  s = api.getCurrencyDisplayName('USD');
  expect(s).toEqual('Dólar estadounidense');

  s = api.getCurrencyDisplayName('USD', { context: 'middle-of-text' });
  expect(s).toEqual('dólar estadounidense');

  api = numbersApi('fr');
  s = api.getCurrencyDisplayName('USD');
  expect(s).toEqual('Dollar des États-Unis');

  s = api.getCurrencyDisplayName('USD', { context: 'middle-of-text' });
  expect(s).toEqual('dollar des États-Unis');

  s = api.getCurrencyDisplayName('USD', { context: 'invalid' as ContextType });
  expect(s).toEqual('dollar des États-Unis');
});

test('currency plural names', () => {
  let api = numbersApi('en');
  let s: string;

  s = api.getCurrencyPluralName('0', 'USD');
  expect(s).toEqual('US dollars');

  s = api.getCurrencyPluralName('1', 'USD');
  expect(s).toEqual('US dollar');

  s = api.getCurrencyPluralName('1.1', 'USD');
  expect(s).toEqual('US dollars');

  s = api.getCurrencyPluralName('2', 'USD');
  expect(s).toEqual('US dollars');

  api = numbersApi('es');
  s = api.getCurrencyPluralName('1', 'USD');
  expect(s).toEqual('Dólar estadounidense');

  s = api.getCurrencyPluralName('2', 'USD');
  expect(s).toEqual('Dólares estadounidenses');

  s = api.getCurrencyPluralName('2', 'USD', { context: 'middle-of-text' });
  expect(s).toEqual('dólares estadounidenses');

  api = numbersApi('fr');
  s = api.getCurrencyPluralName('0', 'USD');
  expect(s).toEqual('Dollar des États-Unis');

  s = api.getCurrencyPluralName('1', 'USD');
  expect(s).toEqual('Dollar des États-Unis');

  s = api.getCurrencyPluralName('2', 'USD');
  expect(s).toEqual('Dollars des États-Unis');

  s = api.getCurrencyPluralName('2', 'USD', { context: 'middle-of-text' });
  expect(s).toEqual('dollars des États-Unis');
});

test('currency special decimal', () => {
  let api = numbersApi('pt-PT');

  // Special decimal for the PTE currency in pt-PT
  let s = api.formatCurrency(1, 'PTE');
  expect(s).toEqual('1$00\xa0\u200b');

  const p = api.formatCurrencyToParts(1, 'PTE');
  expect(p).toEqual([
    { type: 'integer', value: '1' },
    { type: 'decimal', value: '$' },
    { type: 'fraction', value: '00' },
    { type: 'literal', value: '\xa0' },
    { type: 'currency', value: '\u200b' },
  ]);

  s = api.formatCurrency(100.5, 'PTE');
  expect(s).toEqual('100$50\xa0\u200b');

  s = api.formatCurrency(10689.5, 'PTE', { group: true });
  expect(s).toEqual('10\xa0689$50\xa0\u200b');

  api = numbersApi('pt-CV');
  s = api.formatCurrency(100.5, 'CVE');
  expect(s).toEqual('100$50\xa0\u200b');

  // fr-CH different decimal for currency values
  api = numbersApi('fr-CH');
  s = api.formatDecimal(100.5);
  expect(s).toEqual('100,5');

  s = api.formatCurrency(100.5, 'CHF');
  expect(s).toEqual('100.50\xa0CHF');
});

test('currency non-latn', () => {
  const api = numbersApi('km');
  let s: string;

  s = api.formatCurrency('123456789', 'USD', { style: 'name' });
  expect(s).toEqual('123,456,789.00 ដុល្លារ​អាមេរិក');

  s = api.formatCurrency('123456789', 'USD', { style: 'code', nu: 'deva' });
  expect(s).toEqual('१२३,४५६,७८९.०० USD');
});

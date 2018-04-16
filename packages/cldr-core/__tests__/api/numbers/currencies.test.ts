import { CurrencyType } from '@phensley/cldr-schema';
import { languageBundle } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Part } from '../../../src/types';
import {
  Bundle,
  CurrencyFormatOptions,
  CurrencyFormatStyleType,
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

test('currency unknown style', () => {
  const opts: CurrencyFormatOptions = { style: 'UNKNOWN' as CurrencyFormatStyleType };
  const api = numbersApi('en');
  let actual: string;

  actual = api.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('');
});

test('currency', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  const api = numbersApi('en');
  let s: string;

  s = api.formatCurrency('12345.234', 'USD', opts);
  expect(s).toEqual('$12,345.23');

  opts.maximumFractionDigits = 0;
  s = api.formatCurrency('1.567', 'USD', opts);
  expect(s).toEqual('$2');
});

test('currency accounting', () => {
  const opts: CurrencyFormatOptions = { style: 'accounting', group: true };
  let api = numbersApi('en');
  let s: string;

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
  expect(s).toEqual('-12,346 yenes');
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
  expect(s).toEqual('-12 Tsd. €');

  s = e.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-12 Tsd. £');

  s = e.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-12 Tsd. ¥');

  e = numbersApi('es-419');
  s = e.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-12 mil EUR');

  s = e.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-12 mil GBP');

  s = e.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-12 mil JPY');

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
  expect(s).toEqual('¥12345');

  opts.minimumFractionDigits = 2;
  s = api.formatCurrency('12345.019999', 'JPY', opts);
  expect(s).toEqual('¥12345.02');
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
  expect(s).toEqual('12.345,23$');

  opts = { style: 'symbol', symbolWidth: 'default', group: true, nu: 'native' };
  s = api.formatCurrency('12345.234', 'USD', opts);
  expect(s).toEqual('១២.៣៤៥,២៣$');

  s = api.formatCurrency('12345.234', 'BAD', opts);
  expect(s).toEqual('១២.៣៤៥,២៣\u00a0BAD');
});

test('currency parts', () => {
  const api = numbersApi('en');
  let p: Part[];

  const opts: CurrencyFormatOptions = { style: 'accounting', group: true };
  p = api.formatCurrencyToParts('12345.234', 'USD', opts);
  expect(p).toEqual([
    { type: 'currency', value: '$' },
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '23' }
  ]);

  opts.style = 'code';
  p = api.formatCurrencyToParts('1002123.0166', 'AUD', opts);
  expect(p).toEqual([
    { type: 'digits', value: '1' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '002' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '123' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '02' },
    { type: 'literal', value: ' ' },
    { type: 'unit', value: 'AUD' }
  ]);

  opts.style = 'short';
  p = api.formatCurrencyToParts('123456789.123', 'EUR', opts);
  expect(p).toEqual([
    { type: 'currency', value: '€' },
    { type: 'digits', value: '123' },
    { type: 'literal', value: 'M' }
  ]);
});

test('currency parts spacing', () => {
  let api = numbersApi('en');
  let s: Part[];

  s = api.formatCurrencyToParts('12345.234', 'BAD', { group: true });
  expect(s).toEqual([
    { type: 'currency', value: 'BAD' },
    { type: 'spacer', value: '\u00a0' },
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '23' }
  ]);

  api = numbersApi('km');
  s = api.formatCurrencyToParts('12345.234', 'BAD', { group: true, nu: 'native' });
  expect(s).toEqual([
    { type: 'digits', value: '១២' },
    { type: 'group', value: '.' },
    { type: 'digits', value: '៣៤៥' },
    { type: 'decimal', value: ',' },
    { type: 'digits', value: '២៣' },
    { type: 'spacer', value: '\u00a0' },
    { type: 'currency', value: 'BAD' }
  ]);

  s = api.formatCurrencyToParts('12345.234', 'BAD', { group: true });
  expect(s).toEqual([
    { type: 'digits', value: '12' },
    { type: 'group', value: '.' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: ',' },
    { type: 'digits', value: '23' },
    { type: 'spacer', value: '\u00a0' },
    { type: 'currency', value: 'BAD' }
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

  let s = api.getCurrencyDisplayName('USD');
  expect(s).toEqual('US Dollar');

  s = api.getCurrencyPluralName('USD', 'one');
  expect(s).toEqual('US dollar');

  s = api.getCurrencyPluralName('USD', 'two');
  expect(s).toEqual('US dollars');

  s = api.getCurrencyPluralName('USD', 'other');
  expect(s).toEqual('US dollars');

  api = numbersApi('en-GB');
  s = api.getCurrencyDisplayName('USD');
  expect(s).toEqual('US Dollar');

  api = numbersApi('es-419');
  s = api.getCurrencyDisplayName('USD');
  expect(s).toEqual('dólar estadounidense');

  api = numbersApi('fr');
  s = api.getCurrencyDisplayName('USD');
  expect(s).toEqual('dollar des États-Unis');
});

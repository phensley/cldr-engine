import { CurrencyType } from '@phensley/cldr-schema';
import { EN, EN_GB, ES_419, FR, DE, KM, ZH } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Part } from '../../../src/types';
import {
  CurrencyFormatOptions,
  CurrencyFormatStyleType,
  DecimalFormatOptions,
  DecimalFormatStyleType,
  NumbersEngine,
  NumbersInternal,
  WrapperInternal
} from '../../../src/engine';

const INTERNAL = new NumbersInternal(buildSchema(), new WrapperInternal());

test('currency unknown style', () => {
  const opts: CurrencyFormatOptions = { style: 'UNKNOWN' as CurrencyFormatStyleType };
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = engine.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('');
});

test('currency', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = engine.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('$12,345.23');

  opts.maximumFractionDigits = 0;
  actual = engine.formatCurrency('1.567', 'USD', opts);
  expect(actual).toEqual('$2');
});

test('currency accounting', () => {
  const opts: CurrencyFormatOptions = { style: 'accounting', group: true };
  let engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = engine.formatCurrency('-12345.6789', 'EUR', opts);
  expect(actual).toEqual('(€12,345.68)');

  actual = engine.formatCurrency('-12345.6789', 'GBP', opts);
  expect(actual).toEqual('(£12,345.68)');

  actual = engine.formatCurrency('-12345.6789', 'JPY', opts);
  expect(actual).toEqual('(¥12,346)');

  engine = new NumbersEngine(INTERNAL, DE);
  actual = engine.formatCurrency('-12345.6789', 'EUR', opts);
  expect(actual).toEqual('-12.345,68 €');

  actual = engine.formatCurrency('-12345.6789', 'GBP', opts);
  expect(actual).toEqual('-12.345,68 £');

  actual = engine.formatCurrency('-12345.6789', 'JPY', opts);
  expect(actual).toEqual('-12.346 ¥');

  engine = new NumbersEngine(INTERNAL, ES_419);
  actual = engine.formatCurrency('-12345.6789', 'EUR', opts);
  expect(actual).toEqual('-EUR 12,345.68');

  actual = engine.formatCurrency('-12345.6789', 'GBP', opts);
  expect(actual).toEqual('-GBP 12,345.68');

  actual = engine.formatCurrency('-12345.6789', 'JPY', opts);
  expect(actual).toEqual('-JPY 12,346');
});

test('currency name', () => {
  const opts: CurrencyFormatOptions = { style: 'name', group: true };
  let engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = engine.formatCurrency('-12345.6789', 'EUR', opts);
  expect(actual).toEqual('-12,345.68 euros');

  actual = engine.formatCurrency('-12345.6789', 'GBP', opts);
  expect(actual).toEqual('-12,345.68 British pounds');

  actual = engine.formatCurrency('-12345.6789', 'JPY', opts);
  expect(actual).toEqual('-12,346 Japanese yen');

  engine = new NumbersEngine(INTERNAL, DE);
  actual = engine.formatCurrency('-12345.6789', 'EUR', opts);
  expect(actual).toEqual('-12.345,68 Euro');

  actual = engine.formatCurrency('-12345.6789', 'GBP', opts);
  expect(actual).toEqual('-12.345,68 Britische Pfund');

  actual = engine.formatCurrency('-12345.6789', 'JPY', opts);
  expect(actual).toEqual('-12.346 Japanische Yen');

  engine = new NumbersEngine(INTERNAL, ES_419);
  actual = engine.formatCurrency('-12345.6789', 'EUR', opts);
  expect(actual).toEqual('-12,345.68 euros');

  actual = engine.formatCurrency('-12345.6789', 'GBP', opts);
  expect(actual).toEqual('-12,345.68 libras esterlinas');

  actual = engine.formatCurrency('-12345.6789', 'JPY', opts);
  expect(actual).toEqual('-12,346 yenes');
});

test('currency short', () => {
  let opts: CurrencyFormatOptions = { style: 'short', group: true };
  let e = new NumbersEngine(INTERNAL, EN);
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
  e = new NumbersEngine(INTERNAL, DE);
  s = e.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-12 Tsd. €');

  s = e.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-12 Tsd. £');

  s = e.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-12 Tsd. ¥');

  e = new NumbersEngine(INTERNAL, ES_419);
  s = e.formatCurrency('-12345.6789', 'EUR', opts);
  expect(s).toEqual('-12 mil EUR');

  s = e.formatCurrency('-12345.6789', 'GBP', opts);
  expect(s).toEqual('-12 mil GBP');

  s = e.formatCurrency('-12345.6789', 'JPY', opts);
  expect(s).toEqual('-12 mil JPY');

  e = new NumbersEngine(INTERNAL, ZH);
  s = e.formatCurrency('999999.987', 'USD', opts);
  // TODO: support algorithmic numbering for chinese finance
  expect(s).toEqual('US$100万');
});

test('currency fractions', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol' };
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = engine.formatCurrency('12345.019999', 'JPY', opts);
  expect(actual).toEqual('¥12345');

  opts.minimumFractionDigits = 2;
  actual = engine.formatCurrency('12345.019999', 'JPY', opts);
  expect(actual).toEqual('¥12345.02');
});

test('currency spacing', () => {
  let engine = new NumbersEngine(INTERNAL, EN);
  let opts: CurrencyFormatOptions;
  let actual: string;

  opts = { style: 'symbol', group: true };
  actual = engine.formatCurrency('12345.234', 'BAD', opts);
  expect(actual).toEqual('BAD\u00a012,345.23');

  actual = engine.formatCurrency('12345.234', 'AUD', opts);
  expect(actual).toEqual('A$12,345.23');

  opts.symbolWidth = 'narrow';
  actual = engine.formatCurrency('12345.234', 'AUD', opts);
  expect(actual).toEqual('$12,345.23');

  engine = new NumbersEngine(INTERNAL, DE);
  opts.symbolWidth = 'default';

  actual = engine.formatCurrency('12345.234', 'BAD', opts);
  expect(actual).toEqual('12.345,23\u00a0BAD');

  actual = engine.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('12.345,23\u00a0$');

  engine = new NumbersEngine(INTERNAL, KM);
  actual = engine.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('12.345,23$');

  opts = { style: 'symbol', symbolWidth: 'default', group: true, nu: 'native' };
  actual = engine.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('១២.៣៤៥,២៣$');

  actual = engine.formatCurrency('12345.234', 'BAD', opts);
  expect(actual).toEqual('១២.៣៤៥,២៣\u00a0BAD');
});

test('currency parts', () => {
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual: Part[];

  const opts: CurrencyFormatOptions = { style: 'accounting', group: true };
  actual = engine.formatCurrencyParts('12345.234', 'USD', opts);
  expect(actual).toEqual([
    { type: 'currency', value: '$' },
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '23' }
  ]);

  opts.style = 'code';
  actual = engine.formatCurrencyParts('1002123.0166', 'AUD', opts);
  expect(actual).toEqual([
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
  actual = engine.formatCurrencyParts('123456789.123', 'EUR', opts);
  expect(actual).toEqual([
    { type: 'currency', value: '€' },
    { type: 'digits', value: '123' },
    { type: 'literal', value: 'M' }
  ]);
});

test('currency parts spacing', () => {
  let engine = new NumbersEngine(INTERNAL, EN);
  let actual: Part[];

  actual = engine.formatCurrencyParts('12345.234', 'BAD', { group: true });
  expect(actual).toEqual([
    { type: 'currency', value: 'BAD' },
    { type: 'spacer', value: '\u00a0' },
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '23' }
  ]);

  engine = new NumbersEngine(INTERNAL, KM);
  actual = engine.formatCurrencyParts('12345.234', 'BAD', { group: true, nu: 'native' });
  expect(actual).toEqual([
    { type: 'digits', value: '១២' },
    { type: 'group', value: '.' },
    { type: 'digits', value: '៣៤៥' },
    { type: 'decimal', value: ',' },
    { type: 'digits', value: '២៣' },
    { type: 'spacer', value: '\u00a0' },
    { type: 'currency', value: 'BAD' }
  ]);

  actual = engine.formatCurrencyParts('12345.234', 'BAD', { group: true });
  expect(actual).toEqual([
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
//   let engine = new NumbersEngine(INTERNAL, EN);
//   let actual: Part[];

//   actual = engine.formatCurrencyParts('12345.234', 'XXQ' as CurrencyType, opts);
//   expect(actual).toEqual([]);
// });

test('currency symbols', () => {
  const engine = new NumbersEngine(INTERNAL, EN);

  let s = engine.getCurrencySymbol('USD');
  expect(s).toEqual('$');

  s = engine.getCurrencySymbol('USD', 'narrow');
  expect(s).toEqual('$');

  s = engine.getCurrencySymbol('AUD');
  expect(s).toEqual('A$');

  s = engine.getCurrencySymbol('AUD', 'narrow');
  expect(s).toEqual('$');

  s = engine.getCurrencySymbol('BAD');
  expect(s).toEqual('BAD');

  s = engine.getCurrencySymbol('BAD', 'narrow');
  expect(s).toEqual('BAD');

  s = engine.getCurrencySymbol('UNKNOWN' as CurrencyType);
  expect(s).toEqual('');
});

test('currency display names', () => {
  let engine = new NumbersEngine(INTERNAL, EN);

  let s = engine.getCurrencyDisplayName('USD');
  expect(s).toEqual('US Dollar');

  s = engine.getCurrencyPluralName('USD', 'one');
  expect(s).toEqual('US dollar');

  s = engine.getCurrencyPluralName('USD', 'two');
  expect(s).toEqual('US dollars');

  s = engine.getCurrencyPluralName('USD', 'other');
  expect(s).toEqual('US dollars');

  engine = new NumbersEngine(INTERNAL, EN_GB);
  s = engine.getCurrencyDisplayName('USD');
  expect(s).toEqual('US Dollar');

  engine = new NumbersEngine(INTERNAL, ES_419);
  s = engine.getCurrencyDisplayName('USD');
  expect(s).toEqual('dólar estadounidense');

  engine = new NumbersEngine(INTERNAL, FR);
  s = engine.getCurrencyDisplayName('USD');
  expect(s).toEqual('dollar des États-Unis');
});

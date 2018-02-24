import { Plural } from '@phensley/cldr-schema';
import { languageBundle } from '../../_helpers/bundle';
import { buildSchema } from '../../../src/schema';
import {
  CurrencyFormatOptions,
  DecimalFormatOptions,
  NumbersEngine,
  NumbersInternal,
  WrapperInternal
} from '../../../src/engine';

const EN = languageBundle('en');
const EN_GB = languageBundle('en-GB');
const ES_419 = languageBundle('es-419');
const FR = languageBundle('fr');
const DE = languageBundle('de');

const INTERNAL = new NumbersInternal(buildSchema(), new WrapperInternal());

const USD = 'USD';
const AUD = 'AUD';

test('decimals', () => {
  const opts: DecimalFormatOptions = { minimumFractionDigits: 5, minimumIntegerDigits: 3 };
  let formatter = new NumbersEngine(INTERNAL, EN);
  let actual = formatter.formatDecimal('1.234', opts);
  expect(actual).toEqual('001.23400');

  opts.group = true;
  formatter = new NumbersEngine(INTERNAL, DE);
  actual = formatter.formatDecimal('12345.234', opts);
  expect(actual).toEqual('12.345,23400');
});

test('decimal percents', () => {
  const opts: DecimalFormatOptions = { style: 'percent' };
  const formatter = new NumbersEngine(INTERNAL, EN);
  let actual = formatter.formatDecimal('1.234', opts);
  expect(actual).toEqual('123%');

  opts.minimumFractionDigits = 1;
  actual = formatter.formatDecimal('1.234', opts);
  expect(actual).toEqual('123.4%');

  opts.style = 'percent-scaled';
  actual = formatter.formatDecimal('1.234', opts);
  expect(actual).toEqual('1.2%');

  opts.style = 'permille';
  opts.minimumFractionDigits = 0;
  actual = formatter.formatDecimal('1.234', opts);
  expect(actual).toEqual('1234%');
});

test('decimal compact', () => {
  const opts: DecimalFormatOptions = { style: 'short' };
  const formatter = new NumbersEngine(INTERNAL, EN);
  let actual = formatter.formatDecimal('12345.234', opts);
  expect(actual).toEqual('12.3K');

  opts.style = 'long';
  actual = formatter.formatDecimal('12345.234', opts);
  expect(actual).toEqual('12.3 thousand');
});

test('decimal parts', () => {
  const opts: DecimalFormatOptions = { group: true };
  const formatter = new NumbersEngine(INTERNAL, EN);
  const actual = formatter.formatDecimalParts('12345.1234', opts);
  expect(actual).toEqual([
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '123' }
  ]);
});

test('currency', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  const formatter = new NumbersEngine(INTERNAL, EN);

  let actual = formatter.formatCurrency('12345.234', USD, opts);
  expect(actual).toEqual('$12,345.23');

  opts.style = 'accounting';
  actual = formatter.formatCurrency('-12345.234', USD, opts);
  expect(actual).toEqual('($12,345.23)');

  opts.style = 'name';
  actual = formatter.formatCurrency('12345.234', USD, opts);
  expect(actual).toEqual('12,345.23 US dollars');

  actual = formatter.formatCurrency('1', USD, opts);
  expect(actual).toEqual('1.00 US dollars');

  opts.formatMode = 'significant-maxfrac';
  opts.minimumFractionDigits = 0;
  actual = formatter.formatCurrency('1', USD, opts);
  expect(actual).toEqual('1 US dollar');

  opts.formatMode = 'default';
  opts.style = 'short';
  actual = formatter.formatCurrency('12690.234', USD, opts);
  expect(actual).toEqual('$12.69K');

  actual = formatter.formatCurrency('999.9', USD, opts);
  expect(actual).toEqual('$999.9');

  actual = formatter.formatCurrency('999999.9', USD, opts);
  expect(actual).toEqual('$1M');

  actual = formatter.formatCurrency('999900.00', USD, opts);
  expect(actual).toEqual('$999.9K');

  opts.formatMode = 'significant-maxfrac';
  opts.maximumFractionDigits = 0;
  actual = formatter.formatCurrency('999900.00', USD, opts);
  expect(actual).toEqual('$1M');
});

test('currency parts', () => {
  const formatter = new NumbersEngine(INTERNAL, EN);
  const opts: CurrencyFormatOptions = { style: 'accounting', group: true };
  const actual1 = formatter.formatCurrencyParts('12345.234', USD, opts);
  expect(actual1).toEqual([
    { type: 'currency', value: '$' },
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '23' }
  ]);

  opts.style = 'code';
  const actual2 = formatter.formatCurrencyParts('1002123.0166', AUD, opts);
  expect(actual2).toEqual([
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
});

test('currency display names', () => {
  let formatter = new NumbersEngine(INTERNAL, EN);

  let s = formatter.getCurrencySymbol(USD);
  expect(s).toEqual('$');

  s = formatter.getCurrencySymbol(AUD);
  expect(s).toEqual('A$');

  s = formatter.getCurrencySymbol(AUD, true);
  expect(s).toEqual('$');

  s = formatter.getCurrencyDisplayName(USD);
  expect(s).toEqual('US Dollar');

  s = formatter.getCurrencyPluralName(USD, 'one');
  expect(s).toEqual('US dollar');

  s = formatter.getCurrencyPluralName(USD, 'other');
  expect(s).toEqual('US dollars');

  formatter = new NumbersEngine(INTERNAL, EN_GB);
  s = formatter.getCurrencyDisplayName(USD);
  expect(s).toEqual('US Dollar');

  formatter = new NumbersEngine(INTERNAL, ES_419);
  s = formatter.getCurrencyDisplayName(USD);
  expect(s).toEqual('dólar estadounidense');

  formatter = new NumbersEngine(INTERNAL, FR);
  s = formatter.getCurrencyDisplayName(USD);
  expect(s).toEqual('dollar des États-Unis');
});

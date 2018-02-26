import { CurrencyType } from '@phensley/cldr-schema';
import { EN, EN_GB, ES_419, FR, DE, KM } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import {
  CurrencyFormatOptions,
  DecimalFormatOptions,
  DecimalFormatStyleType,
  NumbersEngine,
  NumbersInternal,
  WrapperInternal
} from '../../../src/engine';

const INTERNAL = new NumbersInternal(buildSchema(), new WrapperInternal());

test('decimals', () => {
  const opts: DecimalFormatOptions = { minimumFractionDigits: 5, minimumIntegerDigits: 3 };
  let formatter = new NumbersEngine(INTERNAL, EN);
  let actual = formatter.formatDecimal('1.234', opts);
  expect(actual).toEqual('001.23400');

  actual = formatter.formatDecimal('1.2', { style: 'percent' });

  opts.group = true;
  formatter = new NumbersEngine(INTERNAL, DE);
  actual = formatter.formatDecimal('12345.234', opts);
  expect(actual).toEqual('12.345,23400');
});

test('decimals short', () => {
  const formatter = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = formatter.formatDecimal('1000000000', { style: 'short' });
  expect(actual).toEqual('1B');

  actual = formatter.formatDecimal('1000000000000', { style: 'short' });
  expect(actual).toEqual('1T');

  actual = formatter.formatDecimal('10000000000000', { style: 'short' });
  expect(actual).toEqual('10T');

  actual = formatter.formatDecimal('100000000000000', { style: 'short' });
  expect(actual).toEqual('100T');

  actual = formatter.formatDecimal('1000000000000000', { style: 'short', group: true });
  expect(actual).toEqual('1,000T');

  actual = formatter.formatDecimal('10000000000000000', { style: 'short', group: true });
  expect(actual).toEqual('10,000T');
});

test('decimals long', () => {
  const formatter = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = formatter.formatDecimal('1000000000', { style: 'long' });
  expect(actual).toEqual('1 billion');

  actual = formatter.formatDecimal('1000000000000', { style: 'long' });
  expect(actual).toEqual('1 trillion');

  actual = formatter.formatDecimal('10000000000000', { style: 'long' });
  expect(actual).toEqual('10 trillion');

  actual = formatter.formatDecimal('100000000000000', { style: 'long' });
  expect(actual).toEqual('100 trillion');

  actual = formatter.formatDecimal('1000000000000000', { style: 'long', group: true });
  expect(actual).toEqual('1,000 trillion');

  actual = formatter.formatDecimal('10000000000000000', { style: 'long', group: true });
  expect(actual).toEqual('10,000 trillion');
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
  actual = formatter.formatDecimal('-1.234', opts);
  expect(actual).toEqual('-1234%');
});

test('decimal compact', () => {
  const opts: DecimalFormatOptions = { style: 'short' };
  const formatter = new NumbersEngine(INTERNAL, EN);
  let actual = formatter.formatDecimal('12345.234', opts);
  expect(actual).toEqual('12.3K');

  opts.style = 'long';
  actual = formatter.formatDecimal('12345.234', opts);
  expect(actual).toEqual('12.3 thousand');

  actual = formatter.formatDecimal('0.999', opts);
  expect(actual).toEqual('1');

  actual = formatter.formatDecimal('-0.999', opts);
  expect(actual).toEqual('-1');

  opts.round = 'ceiling';
  opts.formatMode = 'significant-maxfrac';
  opts.maximumFractionDigits = 1;
  actual = formatter.formatDecimal('-0.999', opts);
  expect(actual).toEqual('-0.9');

  opts.maximumFractionDigits = 0;
  actual = formatter.formatDecimal('-0.999', opts);
  expect(actual).toEqual('0');
});

test('decimal rounding', () => {
  const formatter = new NumbersEngine(INTERNAL, EN);
  const opts: DecimalFormatOptions = { style: 'long', formatMode: 'significant-maxfrac' };
  opts.round = 'ceiling';
  opts.maximumFractionDigits = 0;
  const actual = formatter.formatDecimal('-0.9989898', opts);
  expect(actual).toEqual('0');
});

test('decimal parts', () => {
  const opts: DecimalFormatOptions = { group: true };
  const formatter = new NumbersEngine(INTERNAL, EN);
  let actual = formatter.formatDecimalParts('12345.1234', opts);
  expect(actual).toEqual([
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '123' }
  ]);

  opts.style = 'percent';
  actual = formatter.formatDecimalParts('-1.234', opts);
  expect(actual).toEqual([
    { type: 'minus', value: '-' },
    { type: 'digits', value: '123' },
    { type: 'percent', value: '%' }
  ]);
});

test('decimal invalid', () => {
  const opts: DecimalFormatOptions = { style: 'invalid' as DecimalFormatStyleType };
  const formatter = new NumbersEngine(INTERNAL, EN);
  const actual = formatter.formatDecimal('12345.1234', opts);
  expect(actual).toEqual('');
});

test('currency', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  const formatter = new NumbersEngine(INTERNAL, EN);

  let actual = formatter.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('$12,345.23');

  opts.style = 'accounting';
  actual = formatter.formatCurrency('-12345.234', 'USD', opts);
  expect(actual).toEqual('($12,345.23)');

  opts.style = 'name';
  actual = formatter.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('12,345.23 US dollars');

  actual = formatter.formatCurrency('1', 'USD', opts);
  expect(actual).toEqual('1.00 US dollars');

  opts.formatMode = 'significant-maxfrac';
  opts.minimumFractionDigits = 0;
  actual = formatter.formatCurrency('1', 'USD', opts);
  expect(actual).toEqual('1 US dollar');

  opts.formatMode = 'default';
  opts.style = 'short';
  actual = formatter.formatCurrency('12690.234', 'USD', opts);
  expect(actual).toEqual('$12.69K');

  actual = formatter.formatCurrency('999.9', 'USD', opts);
  expect(actual).toEqual('$999.9');

  actual = formatter.formatCurrency('999999.9', 'USD', opts);
  expect(actual).toEqual('$1M');

  actual = formatter.formatCurrency('999900.00', 'USD', opts);
  expect(actual).toEqual('$999.9K');

  opts.formatMode = 'significant-maxfrac';
  opts.maximumFractionDigits = 0;
  actual = formatter.formatCurrency('999900.00', 'USD', opts);
  expect(actual).toEqual('$1M');
});

test('currency spacing', () => {
  let formatter = new NumbersEngine(INTERNAL, EN);
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  let actual = formatter.formatCurrency('12345.234', 'BAD', opts);
  expect(actual).toEqual('BAD\u00a012,345.23');

  actual = formatter.formatCurrency('12345.234', 'AUD', opts);
  expect(actual).toEqual('A$12,345.23');

  opts.symbolWidth = 'narrow';
  actual = formatter.formatCurrency('12345.234', 'AUD', opts);
  expect(actual).toEqual('$12,345.23');

  formatter = new NumbersEngine(INTERNAL, DE);
  opts.symbolWidth = 'default';

  actual = formatter.formatCurrency('12345.234', 'BAD', opts);
  expect(actual).toEqual('12.345,23\u00a0BAD');

  actual = formatter.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('12.345,23\u00a0$');

  formatter = new NumbersEngine(INTERNAL, KM);
  actual = formatter.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('12.345,23$');

  actual = formatter.formatCurrency('12345.234', 'BAD', opts);
  expect(actual).toEqual('12.345,23\u00a0BAD');
});

test('currency parts', () => {
  const formatter = new NumbersEngine(INTERNAL, EN);
  const opts: CurrencyFormatOptions = { style: 'accounting', group: true };
  const actual1 = formatter.formatCurrencyParts('12345.234', 'USD', opts);
  expect(actual1).toEqual([
    { type: 'currency', value: '$' },
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '23' }
  ]);

  opts.style = 'code';
  const actual2 = formatter.formatCurrencyParts('1002123.0166', 'AUD', opts);
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

test('currency parts spacing', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  let formatter = new NumbersEngine(INTERNAL, EN);
  let actual = formatter.formatCurrencyParts('12345.234', 'BAD', opts);
  expect(actual).toEqual([
    { type: 'currency', value: 'BAD' },
    { type: 'spacer', value: '\u00a0' },
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '23' }
  ]);

  formatter = new NumbersEngine(INTERNAL, KM);
  actual = formatter.formatCurrencyParts('12345.234', 'BAD', opts);
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

test('currency display names', () => {
  let formatter = new NumbersEngine(INTERNAL, EN);

  let s = formatter.getCurrencySymbol('USD');
  expect(s).toEqual('$');

  s = formatter.getCurrencySymbol('USD', 'narrow');
  expect(s).toEqual('$');

  s = formatter.getCurrencySymbol('AUD');
  expect(s).toEqual('A$');

  s = formatter.getCurrencySymbol('AUD', 'narrow');
  expect(s).toEqual('$');

  s = formatter.getCurrencySymbol('BAD');
  expect(s).toEqual('BAD');

  s = formatter.getCurrencySymbol('BAD', 'narrow');
  expect(s).toEqual('BAD');

  s = formatter.getCurrencySymbol('UNKNOWN' as CurrencyType);
  expect(s).toEqual('');

  s = formatter.getCurrencyDisplayName('USD');
  expect(s).toEqual('US Dollar');

  s = formatter.getCurrencyPluralName('USD', 'one');
  expect(s).toEqual('US dollar');

  s = formatter.getCurrencyPluralName('USD', 'two');
  expect(s).toEqual('US dollars');

  s = formatter.getCurrencyPluralName('USD', 'other');
  expect(s).toEqual('US dollars');

  formatter = new NumbersEngine(INTERNAL, EN_GB);
  s = formatter.getCurrencyDisplayName('USD');
  expect(s).toEqual('US Dollar');

  formatter = new NumbersEngine(INTERNAL, ES_419);
  s = formatter.getCurrencyDisplayName('USD');
  expect(s).toEqual('dólar estadounidense');

  formatter = new NumbersEngine(INTERNAL, FR);
  s = formatter.getCurrencyDisplayName('USD');
  expect(s).toEqual('dollar des États-Unis');
});

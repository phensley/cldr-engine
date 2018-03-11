import { CurrencyType } from '@phensley/cldr-schema';
import { EN, EN_GB, ES_419, FR, DE, KM } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
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

test('currency', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  const engine = new NumbersEngine(INTERNAL, EN);

  let actual = engine.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('$12,345.23');

  opts.style = 'accounting';
  actual = engine.formatCurrency('-12345.234', 'USD', opts);
  expect(actual).toEqual('($12,345.23)');

  opts.style = 'name';
  actual = engine.formatCurrency('12345.234', 'USD', opts);
  expect(actual).toEqual('12,345.23 US dollars');

  actual = engine.formatCurrency('1', 'USD', opts);
  expect(actual).toEqual('1.00 US dollars');

  opts.formatMode = 'significant-maxfrac';
  opts.minimumFractionDigits = 0;
  actual = engine.formatCurrency('1', 'USD', opts);
  expect(actual).toEqual('1 US dollar');

  opts.formatMode = 'default';
  opts.style = 'short';
  actual = engine.formatCurrency('12690.234', 'USD', opts);
  expect(actual).toEqual('$12.69K');

  actual = engine.formatCurrency('999.9', 'USD', opts);
  expect(actual).toEqual('$999.9');

  actual = engine.formatCurrency('999999.9', 'USD', opts);
  expect(actual).toEqual('$1M');

  actual = engine.formatCurrency('999900.00', 'USD', opts);
  expect(actual).toEqual('$999.9K');

  opts.formatMode = 'significant-maxfrac';
  opts.maximumFractionDigits = 1;
  actual = engine.formatCurrency('999900.00', 'USD', opts);
  expect(actual).toEqual('$999.9K');

  opts.maximumFractionDigits = 0;
  actual = engine.formatCurrency('999900.00', 'USD', opts);
  expect(actual).toEqual('$1M');

  opts.style = 'UNKNOWN' as CurrencyFormatStyleType;
  actual = engine.formatCurrency('1234.567', 'USD', opts);
  expect(actual).toEqual('');
});

test('currency fractions', () => {
  const opts: CurrencyFormatOptions = { style: 'symbol' };
  const engine = new NumbersEngine(INTERNAL, EN);

  let actual = engine.formatCurrency('12345.019999', 'JPY', opts);
  expect(actual).toEqual('¥12345');

  opts.minimumFractionDigits = 2;
  actual = engine.formatCurrency('12345.019999', 'JPY', opts);
  expect(actual).toEqual('¥12345.02');
});

test('currency spacing', () => {
  let engine = new NumbersEngine(INTERNAL, EN);
  const opts: CurrencyFormatOptions = { style: 'symbol', group: true };
  let actual = engine.formatCurrency('12345.234', 'BAD', opts);
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

  actual = engine.formatCurrency('12345.234', 'BAD', opts);
  expect(actual).toEqual('12.345,23\u00a0BAD');
});

test('currency parts', () => {
  const engine = new NumbersEngine(INTERNAL, EN);
  const opts: CurrencyFormatOptions = { style: 'accounting', group: true };
  const actual1 = engine.formatCurrencyParts('12345.234', 'USD', opts);
  expect(actual1).toEqual([
    { type: 'currency', value: '$' },
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '23' }
  ]);

  opts.style = 'code';
  const actual2 = engine.formatCurrencyParts('1002123.0166', 'AUD', opts);
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
  let engine = new NumbersEngine(INTERNAL, EN);
  let actual = engine.formatCurrencyParts('12345.234', 'BAD', opts);
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
  actual = engine.formatCurrencyParts('12345.234', 'BAD', opts);
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

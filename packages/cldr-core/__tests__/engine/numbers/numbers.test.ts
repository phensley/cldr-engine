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
  let engine = new NumbersEngine(INTERNAL, EN);
  let actual = engine.formatDecimal('1.234', opts);
  expect(actual).toEqual('001.23400');

  actual = engine.formatDecimal('1.2', { style: 'percent' });

  opts.group = true;
  engine = new NumbersEngine(INTERNAL, DE);
  actual = engine.formatDecimal('12345.234', opts);
  expect(actual).toEqual('12.345,23400');
});

test('decimals short', () => {
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = engine.formatDecimal('1000000000', { style: 'short' });
  expect(actual).toEqual('1B');

  actual = engine.formatDecimal('1000000000000', { style: 'short' });
  expect(actual).toEqual('1T');

  actual = engine.formatDecimal('10000000000000', { style: 'short' });
  expect(actual).toEqual('10T');

  actual = engine.formatDecimal('100000000000000', { style: 'short' });
  expect(actual).toEqual('100T');

  actual = engine.formatDecimal('1000000000000000', { style: 'short', group: true });
  expect(actual).toEqual('1,000T');

  actual = engine.formatDecimal('10000000000000000', { style: 'short', group: true });
  expect(actual).toEqual('10,000T');
});

test('decimals long', () => {
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = engine.formatDecimal('1000000000', { style: 'long' });
  expect(actual).toEqual('1 billion');

  actual = engine.formatDecimal('1000000000000', { style: 'long' });
  expect(actual).toEqual('1 trillion');

  actual = engine.formatDecimal('10000000000000', { style: 'long' });
  expect(actual).toEqual('10 trillion');

  actual = engine.formatDecimal('100000000000000', { style: 'long' });
  expect(actual).toEqual('100 trillion');

  actual = engine.formatDecimal('1000000000000000', { style: 'long', group: true });
  expect(actual).toEqual('1,000 trillion');

  actual = engine.formatDecimal('10000000000000000', { style: 'long', group: true });
  expect(actual).toEqual('10,000 trillion');
});

test('decimal percents', () => {
  const opts: DecimalFormatOptions = { style: 'percent' };
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual = engine.formatDecimal('1.234', opts);
  expect(actual).toEqual('123%');

  opts.minimumFractionDigits = 1;
  actual = engine.formatDecimal('1.234', opts);
  expect(actual).toEqual('123.4%');

  opts.style = 'percent-scaled';
  actual = engine.formatDecimal('1.234', opts);
  expect(actual).toEqual('1.2%');

  opts.style = 'permille';
  opts.minimumFractionDigits = 0;
  actual = engine.formatDecimal('-1.234', opts);
  expect(actual).toEqual('-1234‰');
});

test('decimal compact', () => {
  const opts: DecimalFormatOptions = { style: 'short' };
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual = engine.formatDecimal('12345.234', opts);
  expect(actual).toEqual('12.3K');

  opts.style = 'long';
  actual = engine.formatDecimal('12345.234', opts);
  expect(actual).toEqual('12.3 thousand');

  actual = engine.formatDecimal('0.999', opts);
  expect(actual).toEqual('1');

  actual = engine.formatDecimal('-0.999', opts);
  expect(actual).toEqual('-1');

  opts.round = 'ceiling';
  opts.formatMode = 'significant-maxfrac';
  opts.maximumFractionDigits = 1;
  actual = engine.formatDecimal('-0.999', opts);
  expect(actual).toEqual('-0.9');

  opts.maximumFractionDigits = 0;
  actual = engine.formatDecimal('-0.999', opts);
  expect(actual).toEqual('0');
});

test('decimal rounding', () => {
  const opts: DecimalFormatOptions = { style: 'long', formatMode: 'significant-maxfrac' };
  const engine = new NumbersEngine(INTERNAL, EN);

  opts.round = 'ceiling';
  opts.maximumFractionDigits = 0;
  let actual = engine.formatDecimal('-0.9989898', opts);
  expect(actual).toEqual('0');

  actual = engine.formatDecimal('-1.9998', opts);
  expect(actual).toEqual('-1');
});

test('decimal parts', () => {
  const opts: DecimalFormatOptions = { group: true };
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual = engine.formatDecimalParts('12345.1234', opts);
  expect(actual).toEqual([
    { type: 'digits', value: '12' },
    { type: 'group', value: ',' },
    { type: 'digits', value: '345' },
    { type: 'decimal', value: '.' },
    { type: 'digits', value: '123' }
  ]);

  opts.style = 'percent';
  actual = engine.formatDecimalParts('-1.234', opts);
  expect(actual).toEqual([
    { type: 'minus', value: '-' },
    { type: 'digits', value: '123' },
    { type: 'percent', value: '%' }
  ]);
});

test('decimal invalid', () => {
  const opts: DecimalFormatOptions = { style: 'invalid' as DecimalFormatStyleType };
  const engine = new NumbersEngine(INTERNAL, EN);
  const actual = engine.formatDecimal('12345.1234', opts);
  expect(actual).toEqual('');
});

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

test('currency display names', () => {
  let engine = new NumbersEngine(INTERNAL, EN);

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

  s = engine.getCurrencyDisplayName('USD');
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

test('plurals', () => {

  // Main test cases are under engine/plurals. These are here to confirm
  // the public interface is covered.

  let engine = new NumbersEngine(INTERNAL, EN);
  expect(engine.getPluralCardinal('0')).toEqual('other');
  expect(engine.getPluralCardinal('1')).toEqual('one');
  expect(engine.getPluralCardinal('2')).toEqual('other');

  expect(engine.getPluralCardinal('1.0')).toEqual('other');
  expect(engine.getPluralCardinal('1.5')).toEqual('other');

  engine = new NumbersEngine(INTERNAL, FR);
  expect(engine.getPluralCardinal('0')).toEqual('one');
  expect(engine.getPluralCardinal('1')).toEqual('one');
  expect(engine.getPluralCardinal('2')).toEqual('other');
  expect(engine.getPluralCardinal('10')).toEqual('other');

  expect(engine.getPluralCardinal('1.2')).toEqual('one');
  expect(engine.getPluralCardinal('1.7')).toEqual('one');
});

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

test('decimals unknown style', () => {
  const opts: DecimalFormatOptions = { style: 'UNKNOWN' as DecimalFormatStyleType };
  const engine = new NumbersEngine(INTERNAL, EN);

  const actual = engine.formatDecimal('1000000000', opts);
  expect(actual).toEqual('');
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

test('decimals short fractions', () => {
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;
  let opts: DecimalFormatOptions;

  opts = { style: 'short', mode: 'default', maximumFractionDigits: 2 };

  actual = engine.formatDecimal('12345.6789', opts);
  expect(actual).toEqual('12.34K');

  actual = engine.formatDecimal('45.6789', opts);
  expect(actual).toEqual('45.68');
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
  opts.mode = 'significant-maxfrac';
  opts.maximumFractionDigits = 1;
  actual = engine.formatDecimal('-0.999', opts);
  expect(actual).toEqual('-0.9');

  opts.maximumFractionDigits = 0;
  actual = engine.formatDecimal('-0.999', opts);
  expect(actual).toEqual('0');
});

test('decimal rounding', () => {
  const opts: DecimalFormatOptions = { style: 'long', mode: 'significant-maxfrac' };
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

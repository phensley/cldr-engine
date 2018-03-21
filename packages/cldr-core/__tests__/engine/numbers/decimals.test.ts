import { CurrencyType } from '@phensley/cldr-schema';
import { EN, EN_GB, ES_419, FR, DE, KM, PL } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import {
  CurrencyFormatOptions,
  Decimal,
  DecimalFormatOptions,
  DecimalFormatStyleType,
  NumbersEngine,
  NumbersInternal,
  WrapperInternal
} from '../../../src';

const INTERNAL = new NumbersInternal(buildSchema(), new WrapperInternal());

test('decimals unknown style', () => {
  const opts: DecimalFormatOptions = { style: 'UNKNOWN' as DecimalFormatStyleType };
  const engine = new NumbersEngine(INTERNAL, EN);

  const actual = engine.formatDecimal('1000000000', opts);
  expect(actual).toEqual('');
});

test('minimum grouping digits', () => {
  const engine = new NumbersEngine(INTERNAL, PL);
  let actual: string;

  actual = engine.formatDecimal('9999', { group: true });
  expect(actual).toEqual('9999');

  actual = engine.formatDecimal('11111', { group: true });
  expect(actual).toEqual('11\u00a0111');
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

test('significant digits', () => {
  const e = new NumbersEngine(INTERNAL, EN);
  let s: string;

  const d = new Decimal('100599.99');

  s = e.formatDecimal('100599.99', { maximumSignificantDigits: 3, round: 'half-even' });
  expect(s).toEqual('101000');

  s = e.formatDecimal('101599.99', { maximumSignificantDigits: 3, round: 'half-even' });
  expect(s).toEqual('102000');
});

test('decimal compact', () => {
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = engine.formatDecimal('12345.234',  { style: 'short' });
  expect(actual).toEqual('12K');

  actual = engine.formatDecimal('12345.234',  { style: 'long' });
  expect(actual).toEqual('12 thousand');

  actual = engine.formatDecimal('0.999', { style: 'long' });
  expect(actual).toEqual('1');

  actual = engine.formatDecimal('-0.999',  { style: 'long' });
  expect(actual).toEqual('-1');

  actual = engine.formatDecimal('-0.999',  { style: 'long', maximumFractionDigits: 1, round: 'ceiling' });
  expect(actual).toEqual('-0.9');

  actual = engine.formatDecimal('-0.999', { style: 'long', maximumFractionDigits: 0, round: 'ceiling' });
  expect(actual).toEqual('0');

  actual = engine.formatDecimal('12345.6789', { style: 'short', maximumFractionDigits: 2 });
  expect(actual).toEqual('12.35K');

  actual = engine.formatDecimal('45.6789', { style: 'short', maximumFractionDigits: 2 });
  expect(actual).toEqual('45.68');

  actual = engine.formatDecimal('3456789123456789', { style: 'long', group: true, minimumFractionDigits: 1 });
  expect(actual).toEqual('3,456.8 trillion');

  actual = engine.formatDecimal('3456789123456789', { style: 'long', group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('3,456.8 trillion');

  actual = engine.formatDecimal('3456789123456789', { style: 'long', group: true, minimumSignificantDigits: 2 });
  expect(actual).toEqual('3,457 trillion');

  actual = engine.formatDecimal('3456789123456789',
    { style: 'long', group: true, maximumSignificantDigits: 3});
  expect(actual).toEqual('3,460 trillion');

  actual = engine.formatDecimal('999.99', { style: 'long', group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('1 thousand');

  actual = engine.formatDecimal('0.999', { style: 'short' });
  expect(actual).toEqual('1');

  actual = engine.formatDecimal('999.99', { style: 'short' });
  expect(actual).toEqual('1K');

  actual = engine.formatDecimal('999999.99', { style: 'short' });
  expect(actual).toEqual('1M');

  actual = engine.formatDecimal('199999.99', { style: 'short' });
  expect(actual).toEqual('200K');

  actual = engine.formatDecimal('199999.99', { style: 'short', minimumFractionDigits: 1 });
  expect(actual).toEqual('200.0K');

  actual = engine.formatDecimal('199999.99', { style: 'short', maximumFractionDigits: 0 });
  expect(actual).toEqual('200K');

  actual = engine.formatDecimal('289300', { style: 'short', minimumFractionDigits: 1 });
  expect(actual).toEqual('289.3K');

  actual = engine.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('12,345.7');

  actual = engine.formatDecimal('12345.67811111', { group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('12,345.7');
});

test('decimal compact significant digits', () => {
  const e = new NumbersEngine(INTERNAL, EN);
  let s: string;

  s = e.formatDecimal('1200', { style: 'short' });
  expect(s).toEqual('1.2K');

  s = e.formatDecimal('1000000000', { style: 'short' });
  expect(s).toEqual('1B');

  s = e.formatDecimal('1000000000', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('1.0B');

  s = e.formatDecimal('1500000000', { style: 'short' });
  expect(s).toEqual('1.5B');

  s = e.formatDecimal('1590000000', { style: 'short' });
  expect(s).toEqual('1.6B');

  s = e.formatDecimal('12345', { style: 'short' });
  expect(s).toEqual('12K');

  s = e.formatDecimal('12345', { style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('12.3K');
});

test('decimal percents', () => {
  const engine = new NumbersEngine(INTERNAL, EN);

  let actual = engine.formatDecimal('1.234', { style: 'percent' });
  expect(actual).toEqual('123%');

  actual = engine.formatDecimal('1.234', { style: 'percent', minimumFractionDigits: 1 });
  expect(actual).toEqual('123.4%');

  actual = engine.formatDecimal('1.234', { style: 'percent-scaled' });
  expect(actual).toEqual('1%');

  actual = engine.formatDecimal('1.234', { style: 'percent-scaled', minimumFractionDigits: 2 });
  expect(actual).toEqual('1.23%');

  actual = engine.formatDecimal('-1.234', { style: 'permille' });
  expect(actual).toEqual('-1234‰');

  actual = engine.formatDecimal('-1.234', { style: 'permille-scaled' });
  expect(actual).toEqual('-1‰');
});

test('decimal rounding', () => {
  const engine = new NumbersEngine(INTERNAL, EN);
  let actual: string;

  actual = engine.formatDecimal('0.998', { round: 'floor', maximumFractionDigits: 0 });
  expect(actual).toEqual('0');

  actual = engine.formatDecimal('0.998', { round: 'floor', maximumFractionDigits: 2 });
  expect(actual).toEqual('0.99');

  actual = engine.formatDecimal('0.998', { round: 'floor', maximumFractionDigits: 3 });
  expect(actual).toEqual('0.998');

  actual = engine.formatDecimal('1.998', { round: 'floor', maximumFractionDigits: 0 });
  expect(actual).toEqual('1');

  actual = engine.formatDecimal('1.998', { round: 'floor', maximumFractionDigits: 2 });
  expect(actual).toEqual('1.99');

  actual = engine.formatDecimal('1.998', { round: 'floor', maximumFractionDigits: 3 });
  expect(actual).toEqual('1.998');

  actual = engine.formatDecimal('-0.998', { round: 'ceiling', maximumFractionDigits: 0 });
  expect(actual).toEqual('0');

  actual = engine.formatDecimal('-0.998', { round: 'ceiling', maximumFractionDigits: 2 });
  expect(actual).toEqual('-0.99');

  actual = engine.formatDecimal('-0.998', { round: 'ceiling', maximumFractionDigits: 3 });
  expect(actual).toEqual('-0.998');

  actual = engine.formatDecimal('-1.998', { round: 'ceiling', maximumFractionDigits: 0 });
  expect(actual).toEqual('-1');

  actual = engine.formatDecimal('-1.998', { round: 'ceiling', maximumFractionDigits: 2 });
  expect(actual).toEqual('-1.99');

  actual = engine.formatDecimal('-1.998', { round: 'ceiling', maximumFractionDigits: 3 });
  expect(actual).toEqual('-1.998');
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

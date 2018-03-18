import { AR, EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Quantity, NumbersInternal, UnitsEngine, UnitsInternal, WrapperInternal } from '../../../src/engine';
import { Part } from '../../../src/types';

const SCHEMA = buildSchema();
const WRAPPER = new WrapperInternal();
const NUMBERS = new NumbersInternal(SCHEMA, WRAPPER);
const UNITS = new UnitsInternal(SCHEMA, NUMBERS, WRAPPER);

test('display name', () => {
  const units = new UnitsEngine(UNITS, NUMBERS, EN);
  expect(units.getDisplayName('g-force')).toEqual('g-force');
  expect(units.getDisplayName('meter-per-second')).toEqual('meters per second');
});

test('number systems', () => {
  let units = new UnitsEngine(UNITS, NUMBERS, AR);
  let s: string;

  s = units.format({ value: '123', unit: 'meter' });
  expect(s).toEqual('١٢٣ مترًا');

  s = units.format({ value: '123', unit: 'meter' }, { nu: 'latn' });
  expect(s).toEqual('123 مترًا');

  units = new UnitsEngine(UNITS, NUMBERS, ZH);

  s = units.format({ value: '123', unit: 'meter' });
  expect(s).toEqual('一二三米');

  s = units.format({ value: '12345', unit: 'kilometer' }, { group: true });
  expect(s).toEqual('一二,三四五公里');

  s = units.format({ value: '123', unit: 'meter' }, { nu: 'latn' });
  expect(s).toEqual('123米');

  s = units.format({ value: '12345', unit: 'kilometer' }, { group: true, nu: 'latn' });
  expect(s).toEqual('12,345公里');
});

test('format string', () => {
  const units = new UnitsEngine(UNITS, NUMBERS, EN);
  let s: string;

  s = units.format({ value: '123', unit: 'meter'});
  expect(s).toEqual('123 meters');

  s = units.format({ value: '12345', unit: 'meter'}, { style: 'long', minimumFractionDigits: 1 });
  expect(s).toEqual('12.3 thousand meters');

  s = units.format({ value: '1', unit: 'pound'}, { style: 'long' });
  expect(s).toEqual('1 pound');

  s = units.format({ value: '1', unit: 'pound'}, { style: 'long', minimumFractionDigits: 1 });
  expect(s).toEqual('1.0 pounds');

  s = units.format({ value: '12345000', unit: 'pound'},
    { length: 'short', style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('12.3M lb');
});

test('unit lengths', () => {
  const units = new UnitsEngine(UNITS, NUMBERS, EN);
  let s: string;

  const q: Quantity = { value: '1', unit: 'meter' };

  s = units.format(q);
  expect(s).toEqual('1 meter');

  s = units.format(q, { length: 'long' });
  expect(s).toEqual('1 meter');

  s = units.format(q, { length: 'short' });
  expect(s).toEqual('1 m');

  s = units.format(q, { length: 'narrow' });
  expect(s).toEqual('1m');
});

test('format parts', () => {
  const units = new UnitsEngine(UNITS, NUMBERS, EN);
  let s: Part[];

  s = units.formatParts({ value: '123', unit: 'meter' });
  expect(s).toEqual([
    { type: 'digits', value: '123'},
    { type: 'literal', value: ' meters'}
  ]);

  s = units.formatParts({ value: '12345000', unit: 'pound'},
    { length: 'short', style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual([
    { type: 'digits', value: '12'},
    { type: 'decimal', value: '.'},
    { type: 'digits', value: '3'},
    { type: 'literal', value: 'M'},
    { type: 'literal', value: ' lb'}
  ]);
});

test('format sequence string', () => {
  const units = new UnitsEngine(UNITS, NUMBERS, EN);
  let s: string;
  let u: Quantity[];

  u = [{ value: '123', unit: 'meter'}, { value: '17.2', unit: 'centimeter' }];
  s = units.formatSequence(u);
  expect(s).toEqual('123 meters 17.2 centimeters');
});

test('format sequence parts', () => {
  const units = new UnitsEngine(UNITS, NUMBERS, EN);
  let s: Part[];
  let u: Quantity[];

  u = [{ value: '123', unit: 'meter'}, { value: '17.2', unit: 'centimeter' }];
  s = units.formatSequenceParts(u);
  expect(s).toEqual([
    { type: 'digits', value: '123' },
    { type: 'literal', value: ' meters'},
    { type: 'literal', value: ' '},
    { type: 'digits', value: '17' },
    { type: 'decimal', value: '.'},
    { type: 'digits', value: '2'},
    { type: 'literal', value: ' centimeters'}
  ]);
});

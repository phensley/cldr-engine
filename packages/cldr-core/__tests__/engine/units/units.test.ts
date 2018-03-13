import { EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
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

test('format sequence', () => {
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

import { Decimal } from '@phensley/decimal';
import { DecimalNumberingSystem } from '../../../src/systems/numbering';
import { NumberingSystem, NumberSymbols } from '../../../src/common/private';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const CHARS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SYMBOLS = {
  decimal: '.',
  group: ',',
} as NumberSymbols;
const NOSYM = {} as NumberSymbols;

test('decimal numbering', () => {
  let d: NumberingSystem;

  d = new DecimalNumberingSystem('latn', DIGITS, SYMBOLS, 1, 3, 3);
  let s: string;

  s = d.formatString(1234, false, 1);
  expect(s).toEqual('1234');

  s = d.formatString(1234.56, false, 1);
  expect(s).toEqual('1234.56');

  s = d.formatString(1234, true, 1);
  expect(s).toEqual('1,234');

  s = d.formatString(1234, false, 10);
  expect(s).toEqual('0000001234');

  s = d.formatString(1234, true, 10);
  expect(s).toEqual('0,000,001,234');

  s = d.formatString(new Decimal('1234.56'), true, 1);
  expect(s).toEqual('1,234.56');

  // Missing symbols
  d = new DecimalNumberingSystem('latn', DIGITS, NOSYM, 2, 3, 3);

  s = d.formatString('1234.56', false, 1);
  expect(s).toEqual('1234.56');

  // Require 2 digits for grouping
  d = new DecimalNumberingSystem('latn', DIGITS, SYMBOLS, 2, 3, 3);

  s = d.formatString(1234, true, 1);
  expect(s).toEqual('1234');

  s = d.formatString(12345, true, 1);
  expect(s).toEqual('12,345');

  // Alternate digits
  d = new DecimalNumberingSystem('latn', CHARS, SYMBOLS, 1, 3, 3);

  s = d.formatString(1234, false, 1);
  expect(s).toEqual('BCDE');

  s = d.formatString(1234, true, 1);
  expect(s).toEqual('B,CDE');

  s = d.formatString(1234, false, 10);
  expect(s).toEqual('AAAAAABCDE');

  s = d.formatString(1234, true, 10);
  expect(s).toEqual('A,AAA,AAB,CDE');
});

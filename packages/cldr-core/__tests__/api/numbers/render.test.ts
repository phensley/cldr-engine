import { CURRENCY_SPACING_MATCHERS } from '../../../src/internals/numbers/render';

const isDigit = (s: string) => CURRENCY_SPACING_MATCHERS['[:digit:]'](s);
const notSymbol = (s: string) => CURRENCY_SPACING_MATCHERS['[:^S:]'](s);

test('symbol', () => {
  expect(notSymbol('$')).toEqual(false); // Sc Currency Symbol
  expect(notSymbol('+')).toEqual(false); // Sm Math Symbol
  expect(notSymbol('^')).toEqual(false); // Sk Modifier Symbol

  expect(notSymbol('-')).toEqual(true); // Pd Dash Punctuation
  expect(notSymbol('%')).toEqual(true); // Po Other Punctuation
  expect(notSymbol(' ')).toEqual(true); // Zs Space Separator
  expect(notSymbol('\u00a0')).toEqual(true); // Zs Space Separator

  expect(notSymbol('0')).toEqual(true); // Nd	Decimal Digit Number
  expect(notSymbol('\u0660')).toEqual(true); // Arabic-Indic digit zero
});

test('digit', () => {
  expect(isDigit('0')).toEqual(true); // Nd	Decimal Digit Number
  expect(isDigit('\u0660')).toEqual(true); // Arabic-Indic digit zero
  expect(isDigit('\u09e6')).toEqual(true); // Bengali digit zero
  expect(isDigit('\u0a69')).toEqual(true); // Gurmukhi Digit three

  expect(isDigit('$')).toEqual(false); // Sc Currency Symbol
  expect(isDigit('+')).toEqual(false); // Sm Math Symbol
  expect(isDigit('^')).toEqual(false); // Sk Modifier Symbol
  expect(isDigit('-')).toEqual(false); // Pd Dash Punctuation
  expect(isDigit('%')).toEqual(false); // Po Other Punctuation
  expect(isDigit(' ')).toEqual(false); // Zs Space Separator
  expect(isDigit('\u00a0')).toEqual(false); // Zs Space Separator
});

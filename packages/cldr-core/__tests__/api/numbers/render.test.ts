import { CURRENCY_SPACING_MATCHERS } from '../../../src/internals/numbers/render';

const isDigit = (s: string) => CURRENCY_SPACING_MATCHERS['[:digit:]'](s);
const notSymSpace = (s: string) => CURRENCY_SPACING_MATCHERS['[[:^S:]&[:^Z:]]'](s);

test('symbol', () => {
  expect(notSymSpace('$')).toEqual(false); // Sc Currency Symbol
  expect(notSymSpace('+')).toEqual(false); // Sm Math Symbol
  expect(notSymSpace('^')).toEqual(false); // Sk Modifier Symbol

  expect(notSymSpace('-')).toEqual(true); // Pd Dash Punctuation
  expect(notSymSpace('%')).toEqual(true); // Po Other Punctuation
  expect(notSymSpace(' ')).toEqual(false); // Zs Space Separator
  expect(notSymSpace('\u00a0')).toEqual(false); // Zs Space Separator

  expect(notSymSpace('0')).toEqual(true); // Nd	Decimal Digit Number
  expect(notSymSpace('\u0660')).toEqual(true); // Arabic-Indic digit zero
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

import { Decimal } from '../src';

const INF_POS = new Decimal('Infinity');
const INF_NEG = new Decimal('-Infinity');
const NAN = new Decimal('NaN');

const POS = new Decimal('10');
const NEG = new Decimal('-10');
const ZERO = new Decimal('0');

test('construction', () => {
  let d: Decimal;

  d = new Decimal('NaN');
  expect(d.isNaN()).toBe(true);
  expect(d.isFinite()).toBe(false);

  d = new Decimal('nan');
  expect(d.isNaN()).toBe(true);
  expect(d.isFinite()).toBe(false);

  d = new Decimal('infinity');
  expect(d.isNaN()).toBe(false);
  expect(d.isFinite()).toBe(false);

  d = new Decimal('Infinity');
  expect(d.isNaN()).toBe(false);
  expect(d.isFinite()).toBe(false);
});

test('absolute value', () => {
  expect(NAN.abs()).toEqual(new Decimal('NaN'));

  expect(INF_POS.abs()).toEqual(INF_POS);
  expect(INF_NEG.abs()).toEqual(INF_POS);
});

test('negate', () => {
  expect(NAN.negate()).toEqual(new Decimal('nan'));
  expect(INF_POS.negate()).toEqual(INF_NEG);
  expect(INF_NEG.negate()).toEqual(INF_POS);
});

test('compare', () => {
  // nan
  expect(NAN.compare(POS)).toBe(-1);
  expect(NAN.compare(NEG)).toBe(-1);
  expect(POS.compare(NAN)).toBe(-1);
  expect(NEG.compare(NAN)).toBe(-1);

  // infinity
  expect(INF_NEG.compare(INF_NEG)).toBe(0);
  expect(INF_POS.compare(INF_POS)).toBe(0);
  expect(INF_NEG.compare(INF_POS)).toBe(-1);
  expect(INF_POS.compare(INF_NEG)).toBe(1);

  expect(INF_POS.compare(POS)).toBe(1);
  expect(INF_POS.compare(POS)).toBe(1);
  expect(INF_NEG.compare(NEG)).toBe(-1);
  expect(INF_NEG.compare(NEG)).toBe(-1);

  expect(INF_POS.compare(NAN)).toBe(-1);
  expect(INF_NEG.compare(NAN)).toBe(-1);
  expect(NAN.compare(INF_POS)).toBe(-1);
  expect(NAN.compare(INF_NEG)).toBe(-1);
});

test('is negative', () => {
  expect(NAN.isNegative()).toBe(false);
  expect(INF_POS.isNegative()).toBe(false);
  expect(INF_NEG.isNegative()).toBe(true);
});

test('is integer', () => {
  expect(NAN.isInteger()).toBe(false);
  expect(INF_POS.isInteger()).toBe(false);
  expect(INF_NEG.isInteger()).toBe(false);
});

test('addition', () => {
  // Any NaN returns NaN
  expect(NAN.add(NAN)).toEqual(NAN);
  expect(NAN.add(POS)).toEqual(NAN);
  expect(POS.add(NAN)).toEqual(NAN);
  expect(NAN.add(INF_POS)).toEqual(NAN);
  expect(NAN.add(INF_NEG)).toEqual(NAN);

  // Infinity + Infinity = Infinity
  expect(INF_POS.add(INF_POS)).toEqual(INF_POS);

  // Infinity + -Infinity = NaN
  expect(INF_POS.add(INF_NEG)).toEqual(NAN);

  // Infinity + 0 = Infinity
  expect(INF_POS.add(ZERO)).toEqual(INF_POS);

  // Infinity + 10 = Infinity
  expect(INF_POS.add(POS)).toEqual(INF_POS);

  // Infinity + -10 = Infinity
  expect(INF_POS.add(NEG)).toEqual(INF_POS);

  // -----

  // -Infinity + Infinity = NaN
  expect(INF_NEG.add(INF_POS)).toEqual(NAN);

  // -Infinity + -Infinity = -Infinity
  expect(INF_NEG.add(INF_NEG)).toEqual(INF_NEG);

  // -Infinity + 0 = -Infinity
  expect(INF_NEG.add(ZERO)).toEqual(INF_NEG);

  // -Infinity + 10 = -Infinity
  expect(INF_NEG.add(POS)).toEqual(INF_NEG);

  // -Infinity + -10 = -Infinity
  expect(INF_NEG.add(NEG)).toEqual(INF_NEG);

    // -----

  // 0 + Infinity = Infinity
  expect(ZERO.add(INF_POS)).toEqual(INF_POS);

  // 0 + -Infinity = -Infinity
  expect(ZERO.add(INF_NEG)).toEqual(INF_NEG);

  // 10 + Infinity = Infinity
  expect(POS.add(INF_POS)).toEqual(INF_POS);

  // 10 + -Infinity = -Infinity
  expect(POS.add(INF_NEG)).toEqual(INF_NEG);

  // -10 + Infinity = Infinity
  expect(NEG.add(INF_POS)).toEqual(INF_POS);

  // -10 + -Infinity = -Infinity
  expect(NEG.add(INF_NEG)).toEqual(INF_NEG);
});

test('subtraction', () => {
  // Any NaN returns NaN
  expect(NAN.subtract(NAN)).toEqual(NAN);
  expect(NAN.subtract(POS)).toEqual(NAN);
  expect(POS.subtract(NAN)).toEqual(NAN);
  expect(NAN.subtract(INF_POS)).toEqual(NAN);
  expect(NAN.subtract(INF_NEG)).toEqual(NAN);

  // -----

  // Infinity - Infinity = NaN
  expect(INF_POS.subtract(INF_POS)).toEqual(NAN);

  // Infinity - -Infinity = Infinity
  expect(INF_POS.subtract(INF_NEG)).toEqual(INF_POS);

  // Infinity - 0 = Infinity
  expect(INF_POS.subtract(ZERO)).toEqual(INF_POS);

  // Infinity - 10 = Infinity
  expect(INF_POS.subtract(POS)).toEqual(INF_POS);

  // Infinity - -10 = Infinity
  expect(INF_POS.subtract(NEG)).toEqual(INF_POS);

  // -----

  // -Infinity - Infinity = -Infinity
  expect(INF_NEG.subtract(INF_POS)).toEqual(INF_NEG);

  // -Infinity - -Infinity = NaN
  expect(INF_NEG.subtract(INF_NEG)).toEqual(NAN);

  // -Infinity - 0 = -Infinity
  expect(INF_NEG.subtract(ZERO)).toEqual(INF_NEG);

  // -Infinity - 10 = -Infinity
  expect(INF_NEG.subtract(POS)).toEqual(INF_NEG);

  // -Infinity - -10 = -Infinity
  expect(INF_NEG.subtract(NEG)).toEqual(INF_NEG);

  // -----

  // 0 - Infinity = -Infinity
  expect(ZERO.subtract(INF_POS)).toEqual(INF_NEG);

  // 0 - -Infinity = Infinity
  expect(ZERO.subtract(INF_NEG)).toEqual(INF_POS);

  // 10 - Infinity = -Infinity
  expect(POS.subtract(INF_POS)).toEqual(INF_NEG);

  // 10 - -Infinity = Infinity
  expect(POS.subtract(INF_NEG)).toEqual(INF_POS);

  // -10 - Infinity = -Infinity
  expect(NEG.subtract(INF_POS)).toEqual(INF_NEG);

  // -10 - -Infinity = Infinity
  expect(NEG.subtract(INF_NEG)).toEqual(INF_POS);
});

test('multiplication', () => {

  // Any NaN returns NaN
  expect(NAN.multiply(NAN)).toEqual(NAN);
  expect(NAN.multiply(POS)).toEqual(NAN);
  expect(POS.multiply(NAN)).toEqual(NAN);
  expect(NAN.multiply(INF_POS)).toEqual(NAN);
  expect(NAN.multiply(INF_NEG)).toEqual(NAN);

  // Infinity * Infinity = Infinity
  expect(INF_POS.multiply(INF_POS)).toEqual(INF_POS);

  // Infinity * -Infinity = -Infinity
  expect(INF_POS.multiply(INF_NEG)).toEqual(INF_NEG);

  // Infinity * 0 = NaN
  expect(INF_POS.multiply(ZERO)).toEqual(NAN);

  // Infinity * 10 = Infinity
  expect(INF_POS.multiply(POS)).toEqual(INF_POS);

  // Infinity * -10 = -Infinity
  expect(INF_POS.multiply(NEG)).toEqual(INF_NEG);

  // -----

  // -Infinity * Infinity = -Infinity
  expect(INF_NEG.multiply(INF_POS)).toEqual(INF_NEG);

  // -Infinity * -Infinity = Infinity
  expect(INF_NEG.multiply(INF_NEG)).toEqual(INF_POS);

  // -Infinity * 0 = NaN
  expect(INF_NEG.multiply(ZERO)).toEqual(NAN);

  // -Infinity * 10 = -Infinity
  expect(INF_NEG.multiply(POS)).toEqual(INF_NEG);

  // -Infinity * -10 = Infinity
  expect(INF_NEG.multiply(NEG)).toEqual(INF_POS);

  // -----

  // 0 * Infinity = NaN
  expect(ZERO.multiply(INF_POS)).toEqual(NAN);

  // 0 * -Infinity = NaN
  expect(ZERO.multiply(INF_NEG)).toEqual(NAN);

  // 10 * Infinity = Infinity
  expect(POS.multiply(INF_POS)).toEqual(INF_POS);

  // 10 * -Infinity = -Infinity
  expect(POS.multiply(INF_NEG)).toEqual(INF_NEG);

  // -10 * Infinity = -Infinity
  expect(NEG.multiply(INF_POS)).toEqual(INF_NEG);

  // -10 * -Infinity = Infinity
  expect(NEG.multiply(INF_NEG)).toEqual(INF_POS);
});

test('division', () => {
  // Any NaN returns NaN
  expect(NAN.divide(NAN)).toEqual(NAN);
  expect(NAN.divide(POS)).toEqual(NAN);
  expect(POS.divide(NAN)).toEqual(NAN);
  expect(NAN.divide(INF_POS)).toEqual(NAN);
  expect(NAN.divide(INF_NEG)).toEqual(NAN);

  // Infinity / Infinity = NaN
  expect(INF_POS.divide(INF_POS)).toEqual(NAN);

  // Infinity / -Infinity = NaN
  expect(INF_POS.divide(INF_NEG)).toEqual(NAN);

  // Infinity / 0 = Infinity
  expect(INF_POS.divide(ZERO)).toEqual(INF_POS);

  // Infinity / 10 = Infinity
  expect(INF_POS.divide(POS)).toEqual(INF_POS);

  // Infinity / -10 = -Infinity
  expect(INF_POS.divide(NEG)).toEqual(INF_NEG);

  // -----

  // -Infinity / Infinity = NaN
  expect(INF_NEG.divide(INF_POS)).toEqual(NAN);

  // -Infinity / -Infinity = NaN
  expect(INF_NEG.divide(INF_NEG)).toEqual(NAN);

  // -Infinity / 0 = -Infinity
  expect(INF_NEG.divide(ZERO)).toEqual(INF_NEG);

  // -Infinity / 10 = -Infinity
  expect(INF_NEG.divide(POS)).toEqual(INF_NEG);

  // -Infinity / -10 = Infinity
  expect(INF_NEG.divide(NEG)).toEqual(INF_POS);

  // -----

  // 0 / Infinity = 0
  expect(ZERO.divide(INF_POS)).toEqual(ZERO);

  // 0 / -Infinity = 0
  expect(ZERO.divide(INF_NEG)).toEqual(ZERO);

  // 10 / Infinity = 0
  expect(POS.divide(INF_POS)).toEqual(ZERO);

  // 10 / -Infinity = 0
  expect(POS.divide(INF_NEG)).toEqual(ZERO);

  // -10 / Infinity = 0
  expect(NEG.divide(INF_POS)).toEqual(ZERO);

  // -10 / -Infinity = 0
  expect(NEG.divide(INF_NEG)).toEqual(ZERO);

  // -----

  // 10 / 0 = Infinity
  expect(POS.divide(ZERO)).toEqual(INF_POS);

  // -10 / 0 = -Infinity
  expect(NEG.divide(ZERO)).toEqual(INF_NEG);
});

test('mod', () => {
  // Any NaN returns NaN
  expect(NAN.mod(NAN)).toEqual(NAN);
  expect(NAN.mod(POS)).toEqual(NAN);
  expect(POS.mod(NAN)).toEqual(NAN);
  expect(NAN.mod(INF_POS)).toEqual(NAN);
  expect(NAN.mod(INF_NEG)).toEqual(NAN);

  // Infinity % Infinity = NaN
  expect(INF_POS.mod(INF_POS)).toEqual(NAN);

  // Infinity % -Infinity = NaN
  expect(INF_POS.mod(INF_NEG)).toEqual(NAN);

  // Infinity % 0 = NaN
  expect(INF_POS.mod(ZERO)).toEqual(NAN);

  // Infinity % 10 = NaN
  expect(INF_POS.mod(POS)).toEqual(NAN);

  // Infinity % -10 = NaN
  expect(INF_POS.mod(NEG)).toEqual(NAN);

  // -----

  // -Infinity % Infinity = NaN
  expect(INF_NEG.mod(INF_POS)).toEqual(NAN);

  // -Infinity % -Infinity = NaN
  expect(INF_NEG.mod(INF_NEG)).toEqual(NAN);

  // -Infinity % 0 = NaN
  expect(INF_NEG.mod(ZERO)).toEqual(NAN);

  // -Infinity % 10 = NaN
  expect(INF_NEG.mod(POS)).toEqual(NAN);

  // -Infinity % -10 = NaN
  expect(INF_NEG.mod(NEG)).toEqual(NAN);

  // -----

  // 0 % Infinity = 0
  expect(ZERO.mod(INF_POS)).toEqual(ZERO);

  // 0 % -Infinity = 0
  expect(ZERO.mod(INF_NEG)).toEqual(ZERO);

  // 10 % Infinity = 10
  expect(POS.mod(INF_POS)).toEqual(POS);

  // 10 % -Infinity = 10
  expect(POS.mod(INF_NEG)).toEqual(POS);

  // -10 % Infinity = -10
  expect(NEG.mod(INF_POS)).toEqual(NEG);

  // -10 % -Infinity = -10
  expect(NEG.mod(INF_NEG)).toEqual(NEG);

  // -----

  // 10 % 0 = NaN
  expect(POS.mod(ZERO)).toEqual(NAN);

  // -10 % 0 = NaN
  expect(NEG.mod(ZERO)).toEqual(NAN);
});

test('misc operations', () => {
    expect(NAN.increment()).toEqual(NAN);
    expect(INF_POS.increment()).toEqual(INF_POS);
    expect(INF_NEG.increment()).toEqual(INF_NEG);

    expect(NAN.decrement()).toEqual(NAN);
    expect(INF_POS.decrement()).toEqual(INF_POS);
    expect(INF_NEG.decrement()).toEqual(INF_NEG);
  });

test('formatting', () => {
  expect(NAN.toString()).toEqual('NaN');
  expect(INF_POS.toString()).toEqual('Infinity');
  expect(INF_NEG.toString()).toEqual('-Infinity');

  expect(NAN.toParts()).toEqual([{ type: 'nan', value: 'NaN' }]);
  expect(INF_POS.toParts()).toEqual([{ type: 'infinity', value: 'Infinity' }]);
  expect(INF_NEG.toParts()).toEqual([{ type: 'infinity', value: '-Infinity' }]);
});

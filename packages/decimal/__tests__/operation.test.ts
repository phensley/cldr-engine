import { allzero, digitCount } from '../src/operations';

test('allzero', () => {
  expect(allzero([], 0)).toEqual(1);
  expect(allzero([0], 1)).toEqual(1);
  expect(allzero([1], 1)).toEqual(0);

  // Coverage
  expect(allzero([1], 0)).toEqual(1);
  expect(allzero([1], 2)).toEqual(1); // index 2 points to empty part of array
});

test('digit count', () => {
  expect(digitCount(1)).toEqual(1);
  expect(digitCount(0)).toEqual(1);
  expect(digitCount(9)).toEqual(1);

  expect(digitCount(10)).toEqual(2);
  expect(digitCount(99)).toEqual(2);

  expect(digitCount(100)).toEqual(3);
  expect(digitCount(999)).toEqual(3);

  expect(digitCount(1000)).toEqual(4);
  expect(digitCount(9999)).toEqual(4);

  expect(digitCount(10000)).toEqual(5);
  expect(digitCount(99999)).toEqual(5);

  expect(digitCount(100000)).toEqual(6);
  expect(digitCount(999999)).toEqual(6);

  expect(digitCount(1000000)).toEqual(7);
  expect(digitCount(9999999)).toEqual(7);

  expect(digitCount(10000000)).toEqual(8);
  expect(digitCount(99999999)).toEqual(8);
});

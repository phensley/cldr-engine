import { divide } from '../src/math';

test('divide internal error', () => {
  // Ensure we cover the case where a length mismatch throws.
  expect(() => divide([], [0, 123], false)).toThrowError();
});

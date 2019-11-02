import { Decimal, DecimalConstants } from '@phensley/decimal';
import { binarySearch } from '../src/utils';

const { ONE, ZERO } = DecimalConstants;

const cmp = (n: number) =>
  (e: number) => e < n ? -1 : e > n ? 1 : 0;

const deccmp = (n: Decimal) =>
  (e: Decimal) => e.compare(n);

test('number', () => {
  let j: number;

  j = binarySearch([1], true, 0, cmp(1));
  expect(j).toEqual(0);

  j = binarySearch([0], true, 0, cmp(1));
  expect(j).toEqual(0);
});

test('decimal', () => {
  let j: number;

  j = binarySearch([ONE], true, 0, deccmp(ONE));
  expect(j).toEqual(0);

  j = binarySearch([ZERO], true, 0, deccmp(ONE));
  expect(j).toEqual(0);

  j = binarySearch([ZERO], true, 0, deccmp(new Decimal('3.12')));
  expect(j).toEqual(0);
});

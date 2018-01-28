import { binarySearch } from '../../src/utils/search';

test('binary search', () => {
  let nums: number[] = [];
  expect(binarySearch(nums, 1)).toEqual(-1);

  nums = [1];
  expect(binarySearch(nums, 0)).toEqual(-1);
  expect(binarySearch(nums, 1)).toEqual(0);
  expect(binarySearch(nums, 2)).toEqual(0);

  nums = [1, 4];
  expect(binarySearch(nums, 0)).toEqual(-1);
  expect(binarySearch(nums, 1)).toEqual(0);
  expect(binarySearch(nums, 2)).toEqual(0);
  expect(binarySearch(nums, 4)).toEqual(1);
  expect(binarySearch(nums, 5)).toEqual(1);

  nums = [1, 4, 8];
  expect(binarySearch(nums, 0)).toEqual(-1);
  expect(binarySearch(nums, 1)).toEqual(0);
  expect(binarySearch(nums, 2)).toEqual(0);
  expect(binarySearch(nums, 4)).toEqual(1);
  expect(binarySearch(nums, 5)).toEqual(1);
  expect(binarySearch(nums, 8)).toEqual(2);
  expect(binarySearch(nums, 9)).toEqual(2);

  nums = [1, 4, 8, 10];
  expect(binarySearch(nums, 0)).toEqual(-1);
  expect(binarySearch(nums, 1)).toEqual(0);
  expect(binarySearch(nums, 2)).toEqual(0);
  expect(binarySearch(nums, 4)).toEqual(1);
  expect(binarySearch(nums, 5)).toEqual(1);
  expect(binarySearch(nums, 8)).toEqual(2);
  expect(binarySearch(nums, 9)).toEqual(2);
  expect(binarySearch(nums, 10)).toEqual(3);
  expect(binarySearch(nums, 11)).toEqual(3);
});

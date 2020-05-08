import { binarySearch } from '../src/search';

const searchlt = (nums: number[], n: number) => binarySearch(nums, true, n);

const searchgt = (nums: number[], n: number) => binarySearch(nums, false, n);

test('binary search less than', () => {
  let nums: number[] = [];
  expect(searchlt(nums, 1)).toEqual(-1);

  nums = [1];
  expect(searchlt(nums, 0)).toEqual(-1);
  expect(searchlt(nums, 1)).toEqual(0);
  expect(searchlt(nums, 2)).toEqual(0);

  nums = [1, 4];
  expect(searchlt(nums, 0)).toEqual(-1);
  expect(searchlt(nums, 1)).toEqual(0);
  expect(searchlt(nums, 2)).toEqual(0);
  expect(searchlt(nums, 4)).toEqual(1);
  expect(searchlt(nums, 5)).toEqual(1);

  nums = [1, 4, 8];
  expect(searchlt(nums, 0)).toEqual(-1);
  expect(searchlt(nums, 1)).toEqual(0);
  expect(searchlt(nums, 2)).toEqual(0);
  expect(searchlt(nums, 4)).toEqual(1);
  expect(searchlt(nums, 5)).toEqual(1);
  expect(searchlt(nums, 8)).toEqual(2);
  expect(searchlt(nums, 9)).toEqual(2);

  nums = [1, 4, 8, 10];
  expect(searchlt(nums, 0)).toEqual(-1);
  expect(searchlt(nums, 1)).toEqual(0);
  expect(searchlt(nums, 2)).toEqual(0);
  expect(searchlt(nums, 4)).toEqual(1);
  expect(searchlt(nums, 5)).toEqual(1);
  expect(searchlt(nums, 8)).toEqual(2);
  expect(searchlt(nums, 9)).toEqual(2);
  expect(searchlt(nums, 10)).toEqual(3);
  expect(searchlt(nums, 11)).toEqual(3);
});

test('binary search greater than', () => {
  let nums: number[] = [];
  expect(searchgt(nums, 1)).toEqual(0);

  nums = [1];
  expect(searchgt(nums, 0)).toEqual(0);
  expect(searchgt(nums, 1)).toEqual(0);
  expect(searchgt(nums, 2)).toEqual(1);

  nums = [1, 4];
  expect(searchgt(nums, 0)).toEqual(0);
  expect(searchgt(nums, 1)).toEqual(0);
  expect(searchgt(nums, 2)).toEqual(1);
  expect(searchgt(nums, 4)).toEqual(1);
  expect(searchgt(nums, 5)).toEqual(2);

  nums = [1, 4, 8];
  expect(searchgt(nums, 0)).toEqual(0);
  expect(searchgt(nums, 1)).toEqual(0);
  expect(searchgt(nums, 2)).toEqual(1);
  expect(searchgt(nums, 4)).toEqual(1);
  expect(searchgt(nums, 5)).toEqual(2);
  expect(searchgt(nums, 8)).toEqual(2);
  expect(searchgt(nums, 9)).toEqual(3);

  nums = [1, 4, 8, 10];
  expect(searchgt(nums, 0)).toEqual(0);
  expect(searchgt(nums, 1)).toEqual(0);
  expect(searchgt(nums, 2)).toEqual(1);
  expect(searchgt(nums, 4)).toEqual(1);
  expect(searchgt(nums, 5)).toEqual(2);
  expect(searchgt(nums, 8)).toEqual(2);
  expect(searchgt(nums, 9)).toEqual(3);
  expect(searchgt(nums, 10)).toEqual(3);
  expect(searchgt(nums, 11)).toEqual(4);
});

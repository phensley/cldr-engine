/**
 * Binary search the array for the element N. Return the index of the number
 * in the array, or the index of the number preceeding it.
 */
export const binarySearch = (nums: number[], n: number): number => {
  let lo = 0;
  let hi = nums.length - 1;
  let mid = 0;

  while (lo <= hi) {
    mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > n) {
      hi = mid - 1;
    } else if (nums[mid] < n) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }

  return lo - 1;
};

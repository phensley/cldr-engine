/**
 * Binary search an array of numbers. The `lessThan` parameter determines which index
 * is returned:
 *
 *    true  - index of element less-than-or-equal to our search
 *    false -               .. greater-than-or-equal ..
 */
export const binarySearch = (elems: number[], lessThan: boolean, n: number): number => {
  let lo = 0;
  let hi = elems.length - 1;
  let mid = 0;
  while (lo <= hi) {
    mid = lo + ((hi - lo) >> 1);
    const e = elems[mid];
    switch (e > n ? 1 : e < n ? -1 : 0) {
      case -1:
        lo = mid + 1;
        break;
      case 1:
        hi = mid - 1;
        break;
      default:
        // found
        return mid;
    }
  }
  // when not found, return the index of the element less than
  // or greater than the desired value
  return lessThan ? lo - 1 : lo;
};

/**
 * Binary search into the array of T, using the return value of 'f'  to
 * direct the search.
 *
 * @public
 */
export const binarySearch = <T>(elems: T[], lessThan: boolean, lo: number, f: (elem: T) => number): number => {
  let hi = elems.length - 1;
  let mid = 0;
  while (lo <= hi) {
    mid = lo + ((hi - lo) >> 1);
    const v = f(elems[mid]);
    switch (v) {
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
  // when not found, return either element less than or greater than
  // the desired value
  return lessThan ? lo - 1 : lo;
};

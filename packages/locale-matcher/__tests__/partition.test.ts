import { getRegionPartition } from '../src/partition';

test('sanity check', () => {
  let p: string[];

  p = getRegionPartition('US');
  expect(p).toEqual(['ζ']);

  p = getRegionPartition('ZZ');
  expect(p).toEqual([]);
});

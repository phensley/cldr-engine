import { getRegionPartition } from '../src/partition';

test('sanity check', () => {
  let p: string[];

  // partitions identifiers are auto-generated greek letters so may change as
  // partition composition changes.
  p = getRegionPartition('US');
  expect(p).toEqual(['δ']);

  p = getRegionPartition('ZZ');
  expect(p).toEqual([]);
});

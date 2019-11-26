import { getRegionPartition } from '../src/partition';

test('sanity check', () => {
  const p = getRegionPartition('US');
  expect(p).toEqual(['ζ']);
});

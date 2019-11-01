import { getRegionPartition } from '../../src/locale/partition';

test('sanity check', () => {
  const p = getRegionPartition('US');
  expect(p).toEqual(['ζ']);
});

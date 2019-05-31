import { macroRegions, regions } from './autogen.partition';

type MapSet = { [x: string]: Set<string> };

const buildMapSet = (raw: string): MapSet => {
  const res: MapSet = {};
  raw.split('|').forEach(e => {
    const [ k, vs ] = e.split(':');
    const set = new Set<string>();
    vs.split('').forEach(v => set.add(v));
    res[k] = set;
  });
  return res;
};

const regionToPartition = buildMapSet(regions);
const macroRegionToPartitions = buildMapSet(macroRegions);

const EMPTY_SET: Set<string> = new Set();

export const getRegionPartition = (region: string): Set<string> => {
  const result = regionToPartition[region] || macroRegionToPartitions[region];
  return result === undefined ? EMPTY_SET : result;
};

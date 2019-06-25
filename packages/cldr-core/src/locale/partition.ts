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

let regionToPartition: MapSet | undefined;
let macroRegionToPartitions: MapSet | undefined;

const EMPTY_SET: Set<string> = new Set();

const init = () => {
  regionToPartition =  buildMapSet(regions);
  macroRegionToPartitions = buildMapSet(macroRegions);
};

export const getRegionPartition = (region: string): Set<string> => {
  if (!regionToPartition) {
    init();
  }
  const result = regionToPartition![region] || macroRegionToPartitions![region];
  return result === undefined ? EMPTY_SET : result;
};

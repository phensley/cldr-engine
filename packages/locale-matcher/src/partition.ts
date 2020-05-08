import { macroRegions, regions } from './autogen.partition';

type ArrayMap = { [x: string]: string[] };

const buildArrayMap = (raw: string): ArrayMap => {
  const res: ArrayMap = {};
  raw.split('|').forEach((e) => {
    const [k, vs] = e.split(':');
    res[k] = vs.split('');
  });
  return res;
};

let regionToPartition: ArrayMap | undefined;
let macroRegionToPartitions: ArrayMap | undefined;

const init = () => {
  regionToPartition = buildArrayMap(regions);
  macroRegionToPartitions = buildArrayMap(macroRegions);
};

export const getRegionPartition = (region: string): string[] => {
  if (!regionToPartition) {
    init();
  }
  const result = regionToPartition![region] || macroRegionToPartitions![region];
  return result === undefined ? [] : result;
};

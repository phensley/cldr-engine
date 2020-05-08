import { getSupplemental } from '../../../cldr';

const DATE = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;

const int = (s: string) => parseInt(s, 10);

const parseDate = (raw: string): number => {
  const m = raw.match(DATE);
  if (m === null) {
    throw new Error(`Parse failed, invalid date: ${raw}`);
  }
  return Date.UTC(int(m[1]), int(m[2]) - 1, int(m[3]), int(m[4]), int(m[5]), 0, 0);
};

/**
 * Parse metazone ranges.
 */
const parseMetazoneRanges = (metazones: any): any => {
  const res: any = {};
  Object.keys(metazones).forEach((k) => {
    const ranges: string[][] = [];
    metazones[k].forEach((range: any) => {
      const { _mzone, _from, _to } = range.usesMetazone;
      const from = _from === undefined ? -1 : parseDate(_from);
      const to = _to === undefined ? -1 : parseDate(_to);
      ranges.unshift([_mzone, from, to]);
    });
    res[k] = ranges;
  });
  return res;
};

export const getMetazones = (): any => {
  const { MetaZones } = getSupplemental();
  const metaZoneRanges = parseMetazoneRanges(MetaZones.ranges);

  return {
    metaZoneRanges,
  };
};

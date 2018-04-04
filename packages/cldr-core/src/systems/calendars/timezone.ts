import { base100decode, bitarrayGet } from '../../resource/encoding';
import { LRU } from '../../utils/lru';
import { binarySearch } from '../../utils/search';

import { metaZoneIds, untilsLookup, zoneDST, zoneLinks } from './autogen.zonedata';

const untilsIndex = untilsLookup.map(base100decode);

export interface ZoneInfo {
  timeZoneId: string;
  metaZoneId: string;
  dst: boolean;
  offset: number;
}

interface ZoneData {
  readonly offsets: number[];
  readonly untils: number[];
  readonly dsts: number[];
  readonly metaZoneIds: string[];
  readonly metaZoneUntils: number[];
}

export class ZoneInfoCache {

  private zoneData: LRU<string, ZoneData>;

  constructor() {
    this.zoneData = new LRU(50);
  }

  get(epoch: number, timeZoneId: string): ZoneInfo {
    const data = this.getZoneData(timeZoneId);
    const len = data.untils.length;
    let index = binarySearch(data.untils, epoch);
    if (index === -1) {
      index++;
    }
    const dst = bitarrayGet(data.dsts, index);
    const offset = index < len ? data.offsets[index] : data.offsets[len - 1];
    index = binarySearch(data.metaZoneUntils, epoch);
    if (index === -1) {
      index++;
    }
    const metaZoneId = data.metaZoneIds[index];
    return { timeZoneId, metaZoneId, dst, offset: offset * 60000 };
  }

  private getZoneData(zoneId: string): ZoneData {
    let zone = this.zoneData.get(zoneId);
    if (zone !== undefined) {
      return zone;
    }
    const link = zoneLinks[zoneId];
    const raw = link === undefined ? zoneDST[zoneId] : zoneDST[link];
    if (raw !== undefined) {
      zone = parseZoneData(raw);
      this.zoneData.set(zoneId, zone);
      return zone;
    }
    return UTC;
  }
}

const parseZoneData = (raw: string): ZoneData => {
  const parts = raw.split('\t');
  const _offsets = parts[0].split(' ').map(o => parseInt(o, 10));
  const index = parts[1].split('').map(Number);
  const offsets = index.map(i => _offsets[i]);
  const _untils = parts[2].split(' ').map(base100decode);
  const dsts = parts[3].split(' ').map(base100decode);
  const _metaZoneIds = parts[4].split(' ').map(base100decode).map(i => metaZoneIds[i]);
  const metaZoneUntils = parts[5].split(' ').map(base100decode);

  const untils: number[] = _untils.map(i => untilsIndex[i]);

  // Expand untils deltas
  const len = untils.length;
  if (len > 0) {
    untils[0] *= 1000;
    for (let i = 1; i < len; i++) {
      untils[i] = untils[i - 1] + (untils[i] * 1000);
    }
  }

  return { offsets, untils, dsts, metaZoneIds: _metaZoneIds, metaZoneUntils };
};

const UTC: ZoneData = parseZoneData(zoneDST['Etc/GMT']);

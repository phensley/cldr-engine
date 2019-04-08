import { MetaZoneType, TimeZoneIndex, TimeZoneType, TimeZoneValues } from '@phensley/cldr-schema';
import { vuintDecode, z85Decode, zigzagDecode } from '@phensley/cldr-utils';
import { TZ } from '@phensley/timezone';

import { zoneAliasRaw } from './autogen.aliases';
import { metazoneData } from './autogen.zonedata';
import { stringToObject } from '../../utils/string';

export interface ZoneInfo {
  zoneid: string;
  stableid: string;
  abbr: string;
  dst: number;
  offset: number;
  metazoneid: string;
}

interface MetazoneRecord {
  offsets: number[];
  untils: number[];
}

export const zoneInfoFromUTC = (zoneid: string, utc: number): ZoneInfo => {
  let tzinfo = TZ.fromUTC(zoneid, utc);
  if (tzinfo === undefined) {
    tzinfo = TZ.utcZone();
  }

  // Check if the id passed in is stable.
  const stableid = TimeZoneIndex.get(zoneid as TimeZoneType) === -1 ?
    metazones.getStableId(tzinfo.zoneid) : zoneid;

  // Use the corrected zone id to lookup the metazone
  const metazoneid = metazones.getMetazone(tzinfo.zoneid, utc);
  return {
    ...tzinfo,
    metazoneid: metazoneid || ('' as MetaZoneType),
    stableid
  };
};

/**
 * Index all metazone information for quick access.
 */
class Metazones {

  readonly metazoneids: string[];
  readonly metazones: MetazoneRecord[] = [];
  readonly zoneToMetazone: Map<string, number> = new Map();

  readonly stableids: Map<string, string> = new Map();

  constructor(raw: any) {
    this.metazoneids = raw.metazoneids;
    const index = vuintDecode(z85Decode(raw.index));
    const offsets = vuintDecode(z85Decode(raw.offsets));
    const untils = vuintDecode(z85Decode(raw.untils), zigzagDecode);

    for (let i = 0; i < index.length; i += 2) {
      const s = index[i];
      const e = index[i + 1];
      const rec = {
        offsets: offsets.slice(s, e),
        untils: untils.slice(s, e)
      };
      this.metazones.push(rec);
    }

    // mapping of zoneid to metazone records
    const zoneids = TZ.zoneIds();
    const zoneindex = vuintDecode(z85Decode(raw.zoneindex));

    // Mapping of tzdb id back to cldr stable id used for schema lookups
    raw.stableids.split('|').forEach((d: string) => {
      const p = d.split(':');
      const i = Number(p[0]);
      const j = Number(p[1]);
      this.stableids.set(zoneids[i], TimeZoneValues[j]);
    });

    // console.log(this.stableids);

    // Sanity-check, since the zoneindex is based off the canonical
    // zoneids array, but could be generated at different times. our test
    // cases should ensure they're in sync, but warn of a discrepancy
    /* istanbul ignore if */
    if (zoneids.length !== zoneindex.length) {
      console.log(`Error: time zone ids and zone index are not in sync!`);
    }

    for (let i = 0; i < zoneindex.length; i++) {
      const mi = zoneindex[i];
      if (mi !== -1) {
        this.zoneToMetazone.set(zoneids[i], mi);
        this.zoneToMetazone.set(zoneids[i].toLowerCase(), mi);
      }
    }
  }

  getMetazone(zoneid: string, utc: number): string | undefined {
    const i = this.zoneToMetazone.get(zoneid);
    if (i !== undefined) {
      const rec = this.metazones[i];
      if (rec !== undefined) {

        // Note: we don't bother with binary search here since the metazone
        // until arrays are quite short.
        const { offsets, untils } = rec;
        const len = untils.length;
        for (let j = len - 1; j > 0; j--) {
          if (untils[j] <= utc) {
            return this.metazoneids[offsets[j]];
          }
        }

        // Hit the end, return the initial metazone id
        return this.metazoneids[offsets[0]];
      }
    }

    // This zone has no metazoneid, e.g. "Etc/GMT+1"
    return undefined;
  }

  getStableId(zoneid: string): string {
    return this.stableids.get(zoneid) || zoneid;
  }
}

const metazones = new Metazones(metazoneData);

/**
 * Checks if this timezone id is an alias.
 */
export const substituteZoneAlias = (id: string): string => {
  const result = timeZoneAliases[id];
  return result === undefined ? id : result;
};

const zoneAlias = stringToObject(zoneAliasRaw, '|', ':');

/**
 * Hand-built list of extra timezone aliases, for remapping timezone identifiers
 * that currently do not map 1:1 with a CLDR identifier or aliass.
 * reated using backward mapping in tz database v2017b.
 *
 * TODO: revisit to translate tz database aliases automatically and merge with
 * cldr aliases.
 */
export const timeZoneAliases: { [x: string]: string } = {
  // Import generated zone aliases from CLDR
  ...zoneAlias,

  'Canada/East-Saskatchewan': 'America/Regina',
};
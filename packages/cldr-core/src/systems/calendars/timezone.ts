import { MetaZoneType } from '@phensley/cldr-schema';
import { vuintDecode, z85Decode, zigzagDecode } from '@phensley/cldr-utils';
import { TZ } from '@phensley/timezone';

import { zoneAliasRaw } from './autogen.aliases';
import { metazoneData } from './autogen.zonedata';
import { stringToObject } from '../../utils/string';

export interface ZoneInfo {
  zoneid: string;
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
  // zoneid = TZ.resolveId(zoneid);
  let tzinfo = TZ.fromUTC(zoneid, utc);
  if (tzinfo === undefined) {
    tzinfo = TZ.utcZone();
  }
  // Use the corrected zone id to lookup the metazone
  const metazoneid = metazones.get(tzinfo.zoneid, utc);
  return {
    ...tzinfo,
    metazoneid: metazoneid || ('' as MetaZoneType)
  };
};

/**
 * Index all metazone information for quick access.
 */
class Metazones {

  readonly metazoneids: string[];
  readonly metazones: MetazoneRecord[] = [];
  readonly zoneToMetazone: Map<string, number> = new Map();

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

    // Sanity-check, since the zoneindex is based off the canonical
    // zoneids array, but could be generated at different times. our test
    // cases should ensure they're in sync, but warn of a discrepancy
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

  get(zoneid: string, utc: number): string | undefined {
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

  // Manual mappings of defunct zones from tz database.
  'Africa/Asmara': 'Africa/Asmera',
  'America/Argentina/Buenos_Aires': 'America/Buenos_Aires',
  'America/Argentina/Catamarca': 'America/Catamarca',
  'America/Argentina/ComodRivadavia': 'America/Catamarca',
  'America/Argentina/Cordoba': 'America/Cordoba',
  'America/Argentina/Jujuy': 'America/Jujuy',
  'America/Argentina/Mendoza': 'America/Mendoza',
  'America/Atikokan': 'America/Coral_Harbour',
  'America/Atka': 'America/Adak',
  'America/Ensenada': 'America/Tijuana',
  'America/Fort_Wayne': 'America/Indianapolis',
  'America/Indiana/Indianapolis': 'America/Indianapolis',
  'America/Kentucky/Louisville': 'America/Louisville',
  'America/Knox_IN': 'America/Indiana/Knox',
  'America/Porto_Acre': 'America/Rio_Branco',
  'America/Rosario': 'America/Cordoba',
  'America/Santa_Isabel': 'America/Tijuana',
  'America/Virgin': 'America/Port_of_Spain',
  'Asia/Ashkhabad': 'Asia/Ashgabat',
  'Asia/Chungking': 'Asia/Shanghai',
  'Asia/Dacca': 'Asia/Dhaka',
  'Asia/Ho_Chi_Minh': 'Asia/Saigon',
  'Asia/Istanbul': 'Europe/Istanbul',
  'Asia/Kathmandu': 'Asia/Katmandu',
  'Asia/Kolkata': 'Asia/Calcutta',
  'Asia/Macao': 'Asia/Macau',
  'Asia/Tel_Aviv': 'Asia/Jerusalem',
  'Asia/Thimbu': 'Asia/Thimphu',
  'Asia/Ujung_Pandang': 'Asia/Makassar',
  'Asia/Ulan_Bator': 'Asia/Ulaanbaatar',
  'Asia/Yangon': 'Asia/Rangoon',
  'Atlantic/Faroe': 'Atlantic/Faeroe',
  'Australia/ACT': 'Australia/Sydney',
  'Australia/Canberra': 'Australia/Sydney',
  'Australia/LHI': 'Australia/Lord_Howe',
  'Australia/NSW': 'Australia/Sydney',
  'Australia/North': 'Australia/Darwin',
  'Australia/Queensland': 'Australia/Brisbane',
  'Australia/South': 'Australia/Adelaide',
  'Australia/Tasmania': 'Australia/Hobart',
  'Australia/Victoria': 'Australia/Melbourne',
  'Australia/West': 'Australia/Perth',
  'Australia/Yancowinna': 'Australia/Broken_Hill',
  'Brazil/Acre': 'America/Rio_Branco',
  'Brazil/DeNoronha': 'America/Noronha',
  'Brazil/East': 'America/Sao_Paulo',
  'Brazil/West': 'America/Manaus',
  'CET': 'Etc/GMT1', // TODO: not in cldr
  'CST6CDT': 'America/Chicago',
  'Canada/Atlantic': 'America/Halifax',
  'Canada/Central': 'America/Winnipeg',
  'Canada/East-Saskatchewan': 'America/Regina',
  'Canada/Eastern': 'America/Regina',
  'Canada/Mountain': 'America/Edmonton',
  'Canada/Newfoundland': 'America/St_Johns',
  'Canada/Pacific': 'America/Vancouver',
  'Canada/Saskatchewan': 'America/Regina',
  'Canada/Yukon': 'America/Whitehorse',
  'Chile/Continental': 'America/Santiago',
  'Chile/EasterIsland': 'Pacific/Easter',
  'Cuba': 'America/Havana',
  'EET': 'Etc/GMT2', // TODO: not in cldr
  'EST5EDT': 'America/New_York',
  'Egypt': 'Africa/Cairo',
  'Eire': 'Europe/Dublin',
  'Etc/GMT+0': 'Etc/GMT',
  'Etc/GMT+1': 'Etc/GMT1',
  'Etc/GMT+10': 'Etc/GMT10',
  'Etc/GMT+11': 'Etc/GMT11',
  'Etc/GMT+12': 'Etc/GMT12',
  'Etc/GMT+2': 'Etc/GMT2',
  'Etc/GMT+3': 'Etc/GMT3',
  'Etc/GMT+4': 'Etc/GMT4',
  'Etc/GMT+5': 'Etc/GMT5',
  'Etc/GMT+6': 'Etc/GMT6',
  'Etc/GMT+7': 'Etc/GMT7',
  'Etc/GMT+8': 'Etc/GMT8',
  'Etc/GMT+9': 'Etc/GMT9',
  'Etc/GMT-0': 'Etc/GMT',
  'Etc/GMT0': 'Etc/GMT',
  'Etc/Greenwich': 'Etc/GMT',
  'Etc/UCT': 'Etc/UTC',
  'Etc/Universal': 'Etc/UTC',
  'Etc/Zulu': 'Etc/UTC',
  'Europe/Nicosia': 'Asia/Nicosia',
  'Europe/Tiraspol': 'Europe/Chisinau',
  'GB': 'Europe/London',
  'GB-Eire': 'Europe/London',
  'GMT': 'Etc/GMT',
  'GMT0': 'Etc/GMT',
};
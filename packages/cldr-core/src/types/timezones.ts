import * as encoding from '../resource/encoding';
import { base100decode } from '../resource/encoding';
import { stringToObject } from '../utils/string';

import { zoneAliasRaw } from './autogen.aliases';
import { zoneDST, zoneLinks, metazoneRanges } from './autogen.zones';

export interface ZoneInfo {
  readonly offsets: number[];
  readonly untils: number[];
  readonly dsts: number[];
}

const zoneCache: { [x: string]: ZoneInfo } = {};

const parseZoneInfo = (raw: string): ZoneInfo => {
  const parts = raw.split('\t');
  const _offsets = parts[0].split(' ').map(o => parseInt(o, 10));
  const index = parts[1].split('').map(Number);
  const offsets = index.map(i => _offsets[i]);
  const untils = parts[2].split(' ').map(base100decode);
  const dsts = parts[3].split(' ').map(base100decode);

  // Expand untils deltas
  const len = untils.length;
  if (len > 0) {
    untils[0] *= 1000;
    for (let i = 1; i < len; i++) {
      untils[i] = untils[i - 1] + (untils[i] * 1000);
    }
  }

  return { offsets, untils, dsts };
};

export const getZoneInfo = (zoneId: string): ZoneInfo => {
  let zone = zoneCache[zoneId];
  if (zone !== undefined) {
    return zone;
  }
  const link = zoneLinks[zoneId];
  const raw = link === undefined ? zoneDST[zoneId] : zoneDST[link];
  if (raw !== undefined) {
    zone = parseZoneInfo(raw);
    zoneCache[zoneId] = zone;
    return zone;
  }
  // Not much else to do for an unidentified zone except default to UTC
  return UTCZoneInfo;
};

export const UTCZoneInfo = getZoneInfo('UTC');

type MetaZoneRange = [string, number, number];

const METAZONE = 0;
const FROM = 1;
const TO = 2;

/**
 * Find the metazone for the given timezone id and epoch timestamp.
 *
 * TODO: flatten to a 1:1 array with metazone and use binary search.
 */
export const findMetaZone = (zoneId: string, epoch: number): string | undefined => {
  const ranges = metazoneRanges[zoneId];
  if (ranges === undefined) {
    return '';
  }
  for (const range of ranges) {
    if (range[FROM] === -1) {
      if (range[TO] === -1 || epoch < range[TO]) {
        return range[METAZONE];
      }
    } else if (range[TO] === -1) {
      if (range[FROM] <= epoch) {
        return range[METAZONE];
      }
    } else if (range[FROM] <= epoch && epoch < range[TO]) {
      return range[METAZONE];
    }
  }
  return undefined;
};

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
const timeZoneAliases: { [x: string]: string } = {
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
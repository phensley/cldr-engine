import { readRows } from './util';
export interface ZoneTabEntry {
  latitude: number;
  longitude: number;
  countries: string;
}

export type ZoneTabMap = { [id: string]: ZoneTabEntry };

/**
 * Parses metadata out of the zone1970.tab file.
 */
export const parseZoneTab = (path: string): ZoneTabMap => {
  const rows = readRows(path, '\t');
  const res: ZoneTabMap = {};
  for (const row of rows) {
    if (row.length < 3) {
      continue;
    }
    const countries = row[0];
    const _latlon = row[1];
    const id = row[2];
    const [latitude, longitude] = parseISO6709(_latlon);
    res[id] = { latitude, longitude, countries };
  }
  return res;
};

/**
 * Quick hacky parser for ISO 6709 latitude/longitude. Not general
 * purpose, only intended to parse zone1970.tab locations.
 */
const parseISO6709 = (s: string): [number, number] => {
  let latitude = 0;
  let longitude = 0;

  [latitude, s] = parseSpec(s, LATITUDE);
  [longitude, s] = parseSpec(s, LONGITUDE);
  return [latitude, longitude];
};

const parseSpec = (s: string, specs: Spec[]): [number, string] => {
  const sign = s.startsWith('-') ? -1 : 1;
  s = s.substring(1);
  let value = 0;
  for (const [width, factor] of specs) {
    if (!s || !/\d/.test(s[0])) {
      break;
    }
    let tmp = s.substring(0, width);
    value += parseInt(tmp, 10) / factor;
    s = s.substring(width);
  }
  return [value * sign, s];
};

type Spec = [number, number];

const LATITUDE: Spec[] = [
  [2, 1],
  [2, 60],
  [2, 3600],
];

const LONGITUDE: Spec[] = [
  [3, 1],
  [2, 60],
  [3, 3600],
];

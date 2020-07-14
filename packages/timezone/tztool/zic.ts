import { DefaultArrayMap, StandardOffsetMap } from './types';
import { readRows } from './util';

export interface ZICResult {
  zones: string[];
  stdoff: StandardOffsetMap;
  links: DefaultArrayMap<string>;
}

const parseSeconds = (s: string): number => {
  let secs = 0;
  let fac = 3600;
  const negative = s.startsWith('-');
  if (negative) {
    s = s.substr(1);
  }
  for (const p of s.split(':')) {
    secs += parseInt(p, 10) * fac;
    fac /= 60.0;
  }
  return secs * (negative ? -1 : 1);
};

/**
 * Extract zones and links from a file in ZIC format.
 */
export const parseZIC = (path: string): ZICResult => {
  const result: ZICResult = {
    zones: [],
    stdoff: {},
    links: new DefaultArrayMap<string>(),
  };

  const rows = readRows(path);
  let currId: string = '';
  let currStd: number = 0;
  for (const row of rows) {
    switch (row[0]) {
      case 'Li':
      case 'L':
        const [to, fr] = row.slice(1);
        result.links.add(to, fr);
        break;

      case '':
      case 'R':
        // ignore blank lines and rules
        break;

      case 'Z':
        const id = row[1];
        result.zones.push(id);

        // set initial standard offset for zone
        currId = id;
        currStd = parseSeconds(row[2]);
        result.stdoff[currId] = currStd;
        break;

      default:
        // zone continuation line updates the standard offset for the zone
        currStd = parseSeconds(row[0]);
        result.stdoff[currId] = currStd;
        break;
    }
  }

  return result;
};

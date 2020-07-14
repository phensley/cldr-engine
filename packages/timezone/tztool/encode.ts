import * as filepath from 'path';
import { TZif } from './tzif';
import { DefaultArrayMap, FrequencySet, StandardOffsetMap } from './types';
import { ZoneTabEntry, ZoneTabMap } from './zonetab';

const MAXLEN = '/* eslint-disable max-len */\n\n';

const DEFAULT_ZONEMETA: ZoneTabEntry = {
  latitude: 0,
  longitude: 0,
  countries: '',
};

/**
 * Encode the time zone data in a compact form.
 */
export const encodeZones = (
  version: string,
  zonedir: string,
  ids: string[],
  links: DefaultArrayMap<string>,
  stdoff: StandardOffsetMap,
  metadata: ZoneTabMap,
) => {
  ids.sort();

  const untilindex = new FrequencySet<number>();

  // PASS 1: Compute until deltas and populate frequnecy set

  for (const id of ids) {
    const path = filepath.join(zonedir, id);
    const info = new TZif(id, path);

    // Determine frequencies of the initial until and subsequent deltas
    let prev: number | undefined;
    for (const t of info.transtimes) {
      if (prev === undefined) {
        untilindex.add(t);
        prev = t;
        continue;
      }

      const delta = t - prev;
      untilindex.add(delta);
      prev = t;
    }
  }

  // PASS 2: ENCODING

  // Encode untils index by frequency
  const untilkeys = untilindex.sort();

  const linkindex: string[] = [];
  links.keys().forEach((dst) => {
    for (const alias of links.get(dst)) {
      linkindex.push(`${alias}:${ids.indexOf(dst)}`);
    }
  });

  const TYPES = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const zoneinfo: string[] = [];

  for (const id of ids) {
    const path = filepath.join(zonedir, id);
    const info = new TZif(id, path);
    const std = stdoff[id];
    if (typeof std !== 'number') {
      throw new Error(`no standard offset found for zone ${id}`);
    }

    const untils: number[] = [];

    let prev: number | undefined;
    const len = info.transtimes.length;
    for (let i = 0; i < len; i++) {
      const t = info.transtimes[i];

      if (prev === undefined) {
        untils.push(untilkeys.indexOf(t));
        prev = t;
        continue;
      }

      const delta = t - prev;
      untils.push(untilkeys.indexOf(delta));
      prev = t;
    }

    // Format:  <zoneabbr>:<dst flag>:<utc offset>
    const localtime = info.localtimetype
      .map((t) => `${info.zoneabbr(t.idx)}:${t.dst}:${t.utoff.toString(36)}`)
      .join('|');

    const types = info.transtypes.map((t: number) => TYPES[t]);
    for (const t of types) {
      if (t === undefined) {
        throw new Error(`timezone types characters need to be expanded!`);
      }
    }

    const zonemeta = metadata[id] || DEFAULT_ZONEMETA;
    const latitude = Math.round(zonemeta.latitude * 1e6).toString(36);
    const longitude = Math.round(zonemeta.longitude * 1e6).toString(36);
    const countries = zonemeta.countries;

    const stdstr = std.toString(36);
    zoneinfo.push(
      `    '${stdstr}_${latitude}_${longitude}_${countries}_${localtime}_` +
        `${types.join('')}_` +
        `${untils.map((n) => n.toString(36)).join(' ')}'`,
    );
  }

  // OUTPUT

  let data = MAXLEN;

  data += `/* Generated from tzdb version ${version} */\n\n`;

  data += `import { RawData } from './types';\n\n`;

  data += `export const rawdata: RawData = {\n`;

  data += `  zoneids: '${ids.join('|')}',\n\n`;

  data += `  links: '${linkindex.join('|')}',\n\n`;

  data += `  index: '${untilkeys.map((n) => n.toString(36)).join(' ')}',\n\n`;

  data += `  zoneinfo: [\n`;
  data += zoneinfo.join(',\n');
  data += '\n]\n';

  data += '};\n';

  return data;
};

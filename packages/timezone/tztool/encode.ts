import * as filepath from 'path';
import { TZif } from './tzif';
import { DefaultArrayMap, FrequencySet } from './types';
import { vuintEncode, z85Encode, zigzagEncode } from '@phensley/cldr-utils';

const TSLINT = '/* tslint:disable:max-line-length whitespace */\n\n';

/**
 * Encode the time zone data in a compact form.
 */
export const encodeZones = (zonedir: string, ids: string[], links: DefaultArrayMap<string>) => {
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
  links.keys().forEach(dst => {
    for (const alias of links.get(dst)) {
      linkindex.push(`${alias}:${ids.indexOf(dst)}`);
    }
  });

  const zoneinfo: string[] = [];

  for (const id of ids) {
    const path = filepath.join(zonedir, id);
    const info = new TZif(id, path);

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
    const localtime = info.localtimetype.map(
      t => `${info.zoneabbr(t.idx)}:${t.dst}:${t.utoff}`).join('|');

    zoneinfo.push(`    '${localtime}\\t` +
      `${info.transtypes.join('')}\\t` +
      `${z85Encode(vuintEncode(untils, zigzagEncode))}'`
    );
  }

  // OUTPUT

  let data = TSLINT;

  data += `import { RawData } from './types';\n\n`;

  data += `export const rawdata: RawData = {\n`;

  data += `  zoneids: '${ids.join('|')}',\n\n`;

  data += `  links: '${linkindex.join('|')}',\n\n`;

  const _untils = z85Encode(vuintEncode(untilkeys, zigzagEncode));
  data += `  index: '${_untils}',\n\n`;

  data += `  zoneinfo: [\n`;
  data += zoneinfo.join(',\n');
  data += '\n]\n';

  data += '};\n';

  return data;
};

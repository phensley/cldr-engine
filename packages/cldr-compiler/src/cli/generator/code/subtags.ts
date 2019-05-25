import * as fs from 'fs';
import { join } from 'path';
import * as zlib from 'zlib';
import { getSupplemental } from '../../../cldr';
import { objectToString, Code, HEADER, NOLINT_MAXLINE } from './util';

/**
 * Split string into lines and split each line into a colon-delimited
 * key / value pair, and convert each group into an object.
 */
const parseSubtagBlock = (raw: string): { [x: string]: string } => {
  return raw.trim().split('\n').map(s => {
    const i = s.indexOf(':');
    return [s.substring(0, i), s.substring(i + 1)];
  }).reduce((o: { [x: string]: string}, [k, v]) => {
    o[k.trim()] = v.trim();
    return o;
  }, {});
};

const getIanaSubtags = () => {
  const path = join(__dirname, '..', '..', '..', '..', 'data', 'raw-iana-subtags.txt.gz');
  const raw = fs.readFileSync(path);
  const data = zlib.gunzipSync(raw).toString('utf-8');
  return data.split('%%').map(parseSubtagBlock).filter(r => r.Type);
};

const pruneRegion = (m: { [x: string]: string }): void =>
  Object.keys(m).forEach(k => {
    const v = m[k];
    if (v.endsWith('-ZZ')) {
      m[k] = v.substring(0, -3);
    }
  });

/**
 * Omit keys whose value is empty.
 */
const filterSubtags = (likely: any) => {
  return Object.keys(likely).reduce((p, key) => {
    const val = likely[key];
    if (val) {
      p[key] = val;
    }
    return p;
  }, {} as any);
};

export const getSubtags = (_data: any): Code[] => {
  const supplemental = getSupplemental();
  const ianaSubtags = getIanaSubtags();

  const grandfathered = objectToString(ianaSubtags.filter(r => r.Type === 'grandfathered').reduce((o, r) => {
    const tag = r.Tag;
    o[tag] = r['Preferred-Value'];
    return o;
  }, {}));

  pruneRegion(supplemental.LikelySubtags);
  const likely = objectToString(filterSubtags(supplemental.LikelySubtags));

  let code = HEADER + NOLINT_MAXLINE;
  code += `export const grandfatheredRaw = '${grandfathered}';\n\n`;

  code += NOLINT_MAXLINE;
  code += `export const likelyRaw = '${likely}';\n`;

  return [
    Code.core(['locale', 'autogen.subtags.ts'], code)
  ];
};

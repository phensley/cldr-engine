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

export const getSubtags = (data: any): Code[] => {
  const supplemental = getSupplemental();
  const ianaSubtags = getIanaSubtags();

  const grandfathered = objectToString(ianaSubtags.filter(r => r.Type === 'grandfathered').reduce((o, r) => {
    const tag = r.Tag;
    o[tag] = r['Preferred-Value'];
    return o;
  }, {}));

  const likely = objectToString(supplemental.LikelySubtags);

  let code = HEADER + NOLINT_MAXLINE;
  code += `export const grandfatheredRaw = '${grandfathered}';\n\n`;
  code += `export const likelyRaw = '${likely}';\n`;

  return [
    Code.core(['locale', 'autogen.subtags.ts'], code)
  ];
};

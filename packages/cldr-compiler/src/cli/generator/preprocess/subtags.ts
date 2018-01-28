import * as fs from 'fs';
import { join } from 'path';
import * as zlib from 'zlib';
import { getSupplemental } from '../../../cldr';

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

export const getSubtags = (): any => {
  const supplemental = getSupplemental();
  const ianaSubtags = getIanaSubtags();

  const grandfatheredTags = ianaSubtags.filter(r => r.Type === 'grandfathered').reduce((o, r) => {
    const tag = r.Tag;
    o[tag] = r['Preferred-Value'];
    return o;
  }, {});

  const { LikelySubtags } = supplemental;

  return {
    grandfatheredTags,
    likelySubtags: supplemental.LikelySubtags
  };
};

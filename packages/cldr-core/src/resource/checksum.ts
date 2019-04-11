import { KeyIndexMap } from '@phensley/cldr-schema';
import { fnv1aChecksum, utf8Encode } from '@phensley/cldr-utils';

/**
 * Compute a checksum on a KeyIndexMap used to configure the
 * schema. This lets us quickly confirm that the resource pack
 * was generated from the config at runtime
 */
export const checksumIndices = (map: KeyIndexMap): string => {
  let s = '';
  const keys = Object.keys(map).sort();
  for (const key of keys) {
    s += JSON.stringify(map[key].keys);
  }
  return fnv1aChecksum(utf8Encode(s)).toString(16);
};

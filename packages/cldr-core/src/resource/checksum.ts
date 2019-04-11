import { KeyIndexMap } from '@phensley/cldr-schema';
import { Checksum } from '@phensley/cldr-utils';

/**
 * Compute a checksum on a KeyIndexMap used to configure the
 * schema. This lets us quickly confirm that the resource pack
 * was generated from the config at runtime
 */
export const checksumIndices = (map: KeyIndexMap): string => {
  const c = new Checksum();
  // Visit map keys in sorted order
  const keys = Object.keys(map).sort();
  for (const key of keys) {
    c.update(key);

    // Mapped values must be visited in their existing order.
    for (const val of map[key].keys) {
      c.update(val);
    }
  }
  return c.get().toString(16);
};

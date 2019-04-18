import * as DEFAULT_CONFIG from './config.json';
import { SchemaConfig } from '@phensley/cldr-core';

const LIM = 10;

const leftpad = (s: string, n: number) => `${' '.repeat(Math.max(0, n - s.length))}'${s}'`;

const quote = (s: string[]) =>  s.map(v => `'${v}'`).join(', ');

const quotevals = (s: string[]) => s.length < LIM ? quote(s) : quote(s.slice(0, LIM)) + ' ...';

/**
 * Compare custom config against canonical and emit messages.
 */
export const validateConfig = (config: SchemaConfig): SchemaConfig => {
  console.log(`[validate] Validating schema config:`);
  const res: SchemaConfig = {};
  const keys = Object.keys(config).sort();

  const maxlen = keys.reduce((p, c: string) => Math.max(p, c.length), 0);

  const ignore: string[] = [];
  for (const key of keys) {
    const canonical = DEFAULT_CONFIG[key as keyof SchemaConfig];

    // Check for invalid keys
    if (canonical === undefined) {
      ignore.push(key);
      continue;
    }

    const padkey = leftpad(key, maxlen);

    // Valid values from the canonical config
    const valid = new Set(canonical);

    // Values to keep in the config
    const keep: string[] = [];

    // Unknown values to remove from the config
    const unk: string[] = [];

    // Check config values against canonical set
    const vals = config[key as keyof SchemaConfig] as string[];
    for (const val of vals) {
      if (!valid.has(val)) {
        unk.push(val);
      } else {
        keep.push(val);
      }
    }

    // Check which valid values were excluded from the config. This may
    // be intentional to reduce the size of the resource pack, but we
    // want to alert the developer to review the canonical config to see
    // if there are any new values they might want to use.
    const kept = new Set(keep);
    const excluded: string[] = [];
    for (const val of canonical) {
      if (!kept.has(val)) {
        excluded.push(val);
      }
    }

    // Report
    if (excluded.length) {
      console.log(`[validate] ${padkey} excluded: ${quotevals(excluded)}`);
    } else {
      console.log(`[validate] ${padkey} complete.`);
    }
    if (unk.length) {
      console.log(`[validate] ${padkey}  invalid: ${quote(unk)}`);
    }

    // Updated config with filtered values
    res[key as keyof SchemaConfig] = keep;
  }

  if (ignore.length) {
    console.log(`[validate] unknown keys ignored: ${quote(ignore)}`);
  }
  return res;
};

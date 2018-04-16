import * as fs from 'fs';
import { join } from 'path';
import * as process from 'process';
import * as child from 'child_process';
import * as zlib from 'zlib';

import { LanguageResolver } from '../../src/locale/resolver';
import { Pack, Bundle } from '../../src/resource';
import { Cache } from '../../src/utils/cache';

/**
 * Load a resource bundle for a given language. If resource file does
 * not exist it is generated.
 */
export const loadBundle = (tag: string): Bundle => {
  const locale = LanguageResolver.resolve(tag);
  const language = locale.language();
  const path = join(__dirname, '..', '..', '..', 'cldr', 'packs', `${language}.json.gz`);

  const compressed = fs.readFileSync(path);
  const raw = zlib.gunzipSync(compressed).toString('utf-8');
  const pack = new Pack(raw);
  return pack.get(locale);
};

const bundleCache = new Cache(loadBundle, 15);

export const languageBundle = (tag: string): Bundle => bundleCache.get(tag);

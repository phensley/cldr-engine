import * as fs from 'fs';
import { join } from 'path';
import * as zlib from 'zlib';

import { LanguageResolver } from '../../src/locale/resolver';
import { Bundle, Pack } from '../../src/resource';
import { Cache } from '../../src/utils/cache';

/**
 * Load a resource pack for a given language.
 */
export const loadPack = (language: string): Pack => {
  const path = join(__dirname, '..', '..', '..', 'cldr', 'packs', `${language}.json.gz`);

  const compressed = fs.readFileSync(path);
  const raw = zlib.gunzipSync(compressed).toString('utf-8');
  return new Pack(raw);
};

/**
 * Load a resource bundle for a given language. If resource file does
 * not exist it is generated.
 */
export const loadBundle = (tag: string): Bundle => {
  const locale = LanguageResolver.resolve(tag);
  const language = locale.language();
  const pack = loadPack(language);
  return pack.get(locale);
};

const bundleCache = new Cache(loadBundle, 15);

export const languageBundle = (tag: string): Bundle => bundleCache.get(tag);

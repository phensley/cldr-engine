import * as crypto from 'crypto';
import * as fs from 'fs';
import { join } from 'path';
import * as zlib from 'zlib';

import { SchemaConfig } from '@phensley/cldr-schema';
import { LRU } from '@phensley/cldr-utils';
import { LanguageResolver } from '../../src/locale/resolver';
import { Bundle, Pack } from '../../src/resource';

import { runPack } from '../../../cldr-compiler/src/cli/compiler/pack';

const TEMPROOT = join(__dirname, '..', '..', '.custom-packs');

const bundleCache = new LRU<Bundle>(15);

interface PackSpec {
  hash: string;
  config: any;
}

const makedir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

/**
 * Create a resource pack on the fly with the given config.
 */
const buildPack = (lang: string, spec: PackSpec): string => {
  const { hash, config } = spec;
  makedir(TEMPROOT);
  makedir(join(TEMPROOT, hash));

  const configpath = join(TEMPROOT, hash, 'config.json');
  if (!fs.existsSync(configpath)) {
    fs.writeFileSync(configpath, config, { encoding: 'utf-8' });
  }

  const outdir = join(TEMPROOT, hash);
  const path = join(outdir, `${lang}.json.gz`);
  if (!fs.existsSync(path)) {
    // compile the pack
    runPack({
      $0: 'cldr-compiler',
      _: [],
      lang,
      out: outdir,
      config: configpath,
    });
  }
  return path;
};

/**
 * Load a resource pack for a given language.
 */
export const loadPack = (language: string, spec?: PackSpec): Pack => {
  let path: string;
  if (spec === undefined) {
    path = join(__dirname, '..', '..', '..', 'cldr', 'packs', `${language}.json.gz`);
  } else {
    path = buildPack(language, spec);
  }
  const compressed = fs.readFileSync(path);
  const raw = zlib.gunzipSync(compressed).toString('utf-8');
  return new Pack(raw);
};

/**
 * Load a resource bundle for a given language. If resource file does
 * not exist it is generated.
 */
export const languageBundle = (tag: string, config?: SchemaConfig): Bundle => {
  const locale = LanguageResolver.resolve(tag);
  const language = locale.language();
  let spec: PackSpec = { hash: '', config: undefined };
  let key = tag;
  if (config !== undefined) {
    console.log(config.calendars);
    const raw = JSON.stringify(config);
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    spec = { hash, config: raw };
    key = `${hash}-${tag}`;
  }

  let bundle = bundleCache.get(key);
  if (bundle === undefined) {
    const pack = loadPack(language, spec);
    bundle = pack.get(locale);
    bundleCache.set(key, bundle);
  } else {
    console.log('found cached, tag');
  }
  return bundle;
};

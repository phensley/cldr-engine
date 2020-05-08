import * as subprocess from 'child_process';
import { createHash } from 'crypto';
import * as fs from 'fs';
import { join } from 'path';

import { LRU } from '@phensley/cldr-utils';
import { LanguageResolver } from '@phensley/locale';

import { Bundle, Pack } from '../../src/resource';
import { CLDRFramework, SchemaConfig } from '../../src';
import { VERSION } from '../../src/utils/version';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

const TEMPROOT = join(__dirname, '..', '..', '.custom-packs');

const bundleCache = new LRU<Bundle>(15);

interface PackSpec {
  hash: string;
  config: string;
}

const makedir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

/**
 * Configure a framework with a loader that will load a custom resource pack.
 * This allows us to test purposefully-mismatched resource pack and framework
 * checksums;
 */
export const customFramework = (path: string, config: SchemaConfig): CLDRFramework => {
  const loader = (_lang: string) => fs.readFileSync(path).toString('utf-8');
  return new CLDRFramework({
    config,
    loader,
  });
};

/**
 * Ensure a custom resource pack is created and return its filesystem path.
 */
export const customPack = (tag: string, config: SchemaConfig): string => {
  const locale = LanguageResolver.resolve(tag);
  const language = locale.language();
  const json = JSON.stringify(config);
  const hash = createHash('sha256').update(json).update(VERSION).digest('hex');
  return buildPack(language, { hash, config: json });
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
  const path = join(outdir, `${lang}.json`);
  if (!fs.existsSync(path)) {
    // compile the pack
    const cmd = '../../../cldr/node_modules/.bin/cldr-compiler';
    const args = ['pack', '-l', lang, '-o', outdir, '-c', configpath];
    subprocess.execFileSync(cmd, args, { cwd: __dirname });
  }
  return path;
};

/**
 * Load a resource pack for a given language.
 */
export const loadPack = (language: string, spec?: PackSpec): Pack => {
  let path: string;
  if (spec === undefined) {
    path = join(__dirname, '..', '..', '..', 'cldr', 'packs', `${language}.json`);
  } else {
    path = buildPack(language, spec);
  }
  const raw = fs.readFileSync(path).toString('utf-8');
  return new Pack(raw);
};

/**
 * Load a resource bundle for a given language. If resource file does
 * not exist it is generated.
 */
export const languageBundle = (tag: string, config?: SchemaConfig): Bundle => {
  const locale = LanguageResolver.resolve(tag);
  const language = locale.language();
  let spec: PackSpec | undefined;
  let key = tag;
  if (config !== undefined) {
    const raw = JSON.stringify(config);
    const hash = createHash('sha256').update(raw).update(VERSION).digest('hex');
    spec = { hash, config: raw };
    key = `${hash}-${pkg.version}-${tag}`;
  }

  let bundle = bundleCache.get(key);
  if (bundle === undefined) {
    const pack = loadPack(language, spec);
    bundle = pack.get(locale);
    bundleCache.set(key, bundle);
  }
  return bundle;
};

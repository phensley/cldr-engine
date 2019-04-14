import * as fs from 'fs';
import { join } from 'path';
import * as zlib from 'zlib';

import { CLDRFramework, CLDROptions } from '../../src';

const packPath = (language: string) => join(__dirname, '..', '..', 'packs', `${language}.json.gz`);

export const loader = (language: string): any => {
  const path = packPath(language);
  const compressed = fs.readFileSync(path);
  return zlib.gunzipSync(compressed).toString('utf-8');
};

const defaultOptions: CLDROptions = {
  debug: true,
  loader,
  packCacheSize: 3,
  patternCacheSize: 50
};

type OptKey = keyof CLDROptions;

export const getCLDR = (options: CLDROptions = defaultOptions): CLDRFramework => {
  const merged: CLDROptions = {};
  const keys: OptKey[] = Object.keys(defaultOptions) as OptKey[];
  for (const key of keys) {
    const val = options[key];
    merged[key] = val === undefined ? defaultOptions[key] : val;
  }
  return new CLDRFramework(merged);
};

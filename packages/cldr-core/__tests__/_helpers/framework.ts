import * as fs from 'fs';
import { join } from 'path';

import { config as defaultconfig } from '../../../cldr/src/config';
import { CLDRFramework, CLDROptions } from '../../src';

const packPath = (language: string) => join(__dirname, '..', '..', '..', 'cldr', 'packs', `${language}.json`);

export const loader = (language: string): any => fs.readFileSync(packPath(language)).toString('utf-8');

export const asyncLoader = (language: string): Promise<any> => {
  const path = packPath(language);
  return new Promise<any>((resolve, reject) =>
    fs.readFile(path, {}, (err, data) => (err ? reject(String(err)) : resolve(data.toString('utf-8')))),
  );
};

const defaultOptions: CLDROptions = {
  config: defaultconfig,
  debug: true,
  loader,
  asyncLoader,
  packCacheSize: 3,
  patternCacheSize: 50,
};

export const getCLDR = (options: CLDROptions = defaultOptions): CLDRFramework => {
  const merged = Object.assign({}, defaultOptions, options);
  return new CLDRFramework(merged);
};

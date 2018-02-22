import * as fs from 'fs';
import { join } from 'path';
import * as zlib from 'zlib';

import { CLDR, CLDROptions, Pack } from '../../src';

const packPath = (language: string) => join(__dirname, '..', '..', 'packs', `${language}.json.gz`);

export const loader = (language: string): any => {
  const path = packPath(language);
  const compressed = fs.readFileSync(path);
  return zlib.gunzipSync(compressed).toString('utf-8');
};

export const asyncLoader = (language: string): Promise<any> => {
  const path = packPath(language);
  return new Promise<any>((resolve, reject) => {
    fs.readFile(path, {}, (err, data) => {
      if (err) {
        return reject(String(err));
      }
      zlib.gunzip(data, (err2, result) => {
        if (err2) {
          return reject(String(err2));
        }
        return resolve(result.toString('utf-8'));
      });
    });
  });
};

const defaultOptions: CLDROptions = {
  loader,
  asyncLoader,
  packCacheSize: 3,
  patternCacheSize: 50
};

export const getCLDR = (options: CLDROptions = defaultOptions): CLDR => new CLDR(options);

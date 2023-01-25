import * as fs from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';

import { getMain } from '../../cldr';
import { buildLocaleMap, checkLanguages, writeJSON } from '../compiler/util';

export interface SchemaArgs {
  out: string;
  lang?: string;
  regions?: string;
  values: boolean;
}

/**
 * Traverse all relevant CLDR JSON files and merge them, converting the leaf
 * values into counts. The count indicates the number of locales having that key.
 */
export const runSchema = (args: yargs.ArgumentsCamelCase<SchemaArgs>) => {
  const localeMap = buildLocaleMap();
  let langs = Object.keys(localeMap).sort();
  if (args.lang) {
    langs = checkLanguages(String(args.lang).split(','), localeMap);
  }
  let regions: Set<string> | undefined;
  if (args.regions) {
    regions = new Set(String(args.regions).split(','));
  }

  const locales: string[] = [];
  langs.forEach((lang) => {
    localeMap[lang].forEach((r) => {
      if (!regions || regions.has(r.tag.region())) {
        locales.push(r.id);
      }
    });
  });

  const dst_main: any = {};
  locales.forEach((locale) => {
    console.warn(`Scanning ${locale}..`);
    const main = getMain(locale, true);
    const counts = keyCounts(main, args.values);
    mergeKeyCounts(dst_main, counts);
  });

  if (!fs.existsSync(args.out)) {
    fs.mkdirSync(args.out);
  }

  writeJSON(join(args.out, 'Schema.json'), dst_main);
};

const isObject = (o: any): boolean => (typeof o === 'object' ? o !== null && !Array.isArray(o) : false);

/**
 * Recurse into an object, replacing all nested leaf values with integer 1.
 */
const keyCounts = (obj: any, includeValues = false) => {
  return Object.keys(obj).reduce((o: any, k) => {
    const v = obj[k];
    if (isObject(v)) {
      o[k] = keyCounts(v, includeValues);
    } else {
      o[k] = includeValues ? { [v]: 1 } : 1;
    }
    return o;
  }, {});
};

/**
 * Merge two or more objects, adding their leaf count values.
 */
const mergeKeyCounts = (dst: any, ...sources: any[]): any => {
  if (!sources.length) {
    return dst;
  }

  const src = sources.shift();
  if (isObject(dst) && isObject(src)) {
    for (const key in src) {
      if (isObject(src[key])) {
        if (!dst[key]) {
          Object.assign(dst, { [key]: {} });
        }
        mergeKeyCounts(dst[key], src[key]);
      } else {
        const v = dst[key];
        dst[key] = v ? src[key] + v : src[key];
      }
    }
  }

  return mergeKeyCounts(dst, ...sources);
};

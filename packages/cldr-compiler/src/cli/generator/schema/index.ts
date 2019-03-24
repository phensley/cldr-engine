import * as fs from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';

import { getMain, getSupplemental } from '../../../cldr';
import { checkLanguages, localeMap, writeJSON } from '../../compiler/util';

const isObject = (o: any): boolean =>
  typeof o === 'object' ? o !== null && !Array.isArray(o) : false;

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

/**
 * Traverse all relevant CLDR JSON files and merge them, converting the leaf
 * values into counts. The count indicates the number of locales having that key.
 */
const run = (args: yargs.Arguments): void => {
  let langs = Object.keys(localeMap).sort();
  if (args.lang) {
    langs = checkLanguages(args.lang.split(','));
  }

  const locales: string[] = [];
  langs.forEach(lang => {
    localeMap[lang].forEach(r => locales.push(r.id));
  });

  const transform = !args.preTransform;
  const sections: any = {};
  locales.forEach(locale => {
    console.warn(`Scanning ${locale}..`);
    const main = getMain(locale, transform);
    Object.keys(main).forEach(key => {
      const prefix = `Main.${key}`;
      const dst = sections[prefix] || {};
      const src = main[key];
      if (!src) {
        return;
      }
      const counts = keyCounts(src, args.withValues);
      mergeKeyCounts(dst, counts);
      sections[prefix] = dst;
    });
  });

  const supplemental = getSupplemental();
  Object.keys(supplemental).forEach(key => {
    const src = supplemental[key];
    sections[`Supplemental.${key}`] = keyCounts(src, args.withValues);
  });

  Object.keys(sections).forEach(key => {
    const obj = sections[key];
    if (!fs.existsSync(args.out)) {
      fs.mkdirSync(args.out);
    }
    writeJSON(join(args.out, `${key}.json`), obj);
  });
};

export const schemaOptions = (argv: yargs.Argv) =>
  argv.command('schema', 'Generate schema', (y: yargs.Argv) => y
    .option('l', { alias: 'lang', description: 'List of languages' })
    .option('n', { alias: 'dry-run' })
    .option('o', { alias: 'out', description: 'Output dir', required: true })
    .option('p', { alias: 'pre-transform', description: 'Pre transform' })
    .option('w', { alias: 'with-values', description: 'With value leaf nodes' }),
    run);

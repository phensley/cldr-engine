/// <reference path="../../../typings.d.ts" />

import * as fs from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';

import * as cldr from 'cldr-data';

const MAIN = [
  'ca-buddhist',
  'ca-gregorian',
  'ca-japanese',
  'ca-persian',
  'characters',
  'contextTransforms',
  'currencies',
  'dateFields',
  'languages',
  'layout',
  'listPatterns',
  'numbers',
  'scripts',
  'territories',
  'timeZoneNames',
  'units',
];

const isObject = (o: any): boolean =>
  typeof o === 'object' ? o !== null && !Array.isArray(o) : false;

const extractValues = (o: any): string[] => {
  let r: string[] = [];
  Object.keys(o).forEach(k => {
    const v = o[k];
    if (isObject(v)) {
      r = r.concat(extractValues(v));
    } else {
      r.push(v);
    }
  });
  return r;
};

const load = (path: string): any => {
  try {
    return cldr(path);
  } catch (e) {
    return {};
  }
};

const run = (args: yargs.Arguments): void => {
  let locales = cldr.availableLocales;
  if (args.lang) {
    locales = (args.lang as string).split(',').map(a => a.trim());
  }

  const grandTotalChars = [0];
  const allStrings = [''];
  locales.forEach(lang => {
    const totalChars = [0];
    const totalJson = [0];
    MAIN.forEach(filename => {
      const path = `main/${lang}/${filename}`;
      const main = load(path);
      const compressed = JSON.stringify(main, undefined, 0);
      const values = extractValues(main);
      const sum = values.reduce((p, c) => p + c.length + 1, 0);
      allStrings[0] += values.join(' ');
      totalChars[0] += sum;
      grandTotalChars[0] += sum;
      totalJson[0] += compressed.length;
      console.log(lang, filename, values.length, compressed.length, sum);
    });
    console.log(`${lang} total: ${totalChars[0]}  ${totalJson[0]}`);
  });

  console.log(`\n grand total chars: ${grandTotalChars[0]}`);
  fs.writeFileSync('./allstrings.txt', allStrings[0], { encoding: 'utf-8' });
};

export const statsOptions = (argv: yargs.Argv) =>
  argv.command('stats', 'Generate stats', (y: yargs.Argv) => y
    .option('l', { alias: 'lang', description: 'List of languages' }),
    run);

import * as fs from 'fs';
import * as filepath from 'path';
import * as yargs from 'yargs';

import fetch, { Response } from 'node-fetch';
import chalk from 'chalk';

const DATAROOT = filepath.resolve(filepath.join(__dirname, '../../../../.cldr'));
const UNICODE_DATA_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt';
const WHICH = ['currency'];

interface UnicodeOptions {
  which?: string[];
}

export const unicodeOptions = (argv: yargs.Argv) =>
  argv.command(
    'unicode',
    'Generate unicode patterns',
    (y: yargs.Argv) =>
      y.option('w', { alias: 'which', type: 'array', description: 'Which patterns to generate' }).choices('w', WHICH),
    run,
  );

const info = (m: string) => console.log(m);

const run = (args: yargs.Arguments<UnicodeOptions>) => {
  if (!args.which) {
    return;
  }
  for (const w of args.which) {
    switch (w) {
      case 'currency':
        genCurrency();
        break;
    }
  }
};

const CURRENCY_CATEGORIES = [
  ['Nd', 'DECIMAL_DIGIT_NUMBER'],
  ['Sm', 'MATH_SYMBOL'],
  ['Sk', 'MODIFIER_SYMBOL'],
  ['Sc', 'CURRENCY_SYMBOL'],
  ['So', 'OTHER_SYMBOL'],
  ['Zs', 'SPACE_SEPARATOR'],
  ['Zl', 'LINE_SEPARATOR'],
  ['Zp', 'PARAGRAPH_SEPARATOR'],
];

const genCurrency = () => {
  download().then(() => {
    const data = loadUnicodeData();
    for (const [category, name] of CURRENCY_CATEGORIES) {
      const selected = selectCategory(data, category);
      const ranges = generateRanges(selected);
      const rx = regex(ranges);
      // TODO: eventually we may generate TS files
      console.log('// eslint-disable-next-line max-len');
      console.log(`const ${name} = ${rx};`);
      console.log('');
    }
  });
};

type Range = [number, number];

const selectCategory = (data: UnicodeDataEntry[], category: string) =>
  data
    .filter((d) => d.category == category)
    .map((d) => parseInt(d.code, 16))
    .filter((code) => code <= 0xffff);

const generateRanges = (codes: number[]): Range[] => {
  const ranges: Range[] = [];
  for (const code of codes) {
    if (code > 0xffff) {
      continue;
    }
    let len = ranges.length;
    if (!len) {
      ranges.push([code, code]);
      continue;
    }
    const curr = ranges[len - 1];
    if (curr[1] == code - 1) {
      curr[1] = code;
      continue;
    }
    ranges.push([code, code]);
  }
  return ranges;
};

const esc = (code: number) => '\\u' + leftpad(code.toString(16), 4, '0');

const regex = (ranges: Range[]): string => {
  let s = '/';
  for (const [start, end] of ranges) {
    s += esc(start);
    if (start != end) {
      s += '-' + esc(end);
    }
  }
  return s + '/';
};

const leftpad = (s: string, n: number, c: string) => {
  let r = '';
  let d = n - s.length;
  while (d > 0) {
    r += c;
    d--;
  }
  return r + s;
};

interface UnicodeDataEntry {
  code: string;
  name: string;
  category: string;
}

const loadUnicodeData = () => {
  const path = filepath.resolve(DATAROOT, 'UnicodeData.txt');
  const raw = fs.readFileSync(path, { encoding: 'utf-8' });
  return parseUnicodeData(raw);
};

const parseUnicodeData = (data: string): UnicodeDataEntry[] => {
  const lines = data.split('\n');
  const result: UnicodeDataEntry[] = [];
  for (const line of lines) {
    const [code, name, category] = line.split(';');
    result.push({
      code,
      name,
      category,
    });
  }
  return result;
};

const download = (): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    const name = 'UnicodeData.txt';
    const path = filepath.resolve(DATAROOT, name);
    if (fs.existsSync(path)) {
      resolve(true);
      return;
    }
    makedirs(DATAROOT, name);
    info(`${chalk.yellow('fetching')} UnicodeData.txt`);
    fetch(UNICODE_DATA_URL).then((r: Response) => {
      if (r.status != 200) {
        reject(`failure downloading: ${r.statusText}`);
        return;
      }
      r.body &&
        r.body
          .pipe(fs.createWriteStream(path, { encoding: 'utf-8' }))
          .on('error', (e: Error) => {
            reject(`failed to save: ${e}`);
          })
          .on('close', () => {
            resolve(true);
          });
    });
  });
};

const makedirs = (root: string, filename: string) => {
  const p = filename.split(filepath.sep);
  for (let i = 0; i < p.length; i++) {
    const dir = filepath.join(root, ...p.slice(0, i));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
};

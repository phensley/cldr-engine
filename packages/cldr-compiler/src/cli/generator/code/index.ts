import * as fs from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';
import { Code } from './util';

import { getAliases } from './aliases';
import { getCurrencies } from './currencies';
import { getDistance } from './distance';
import { getLocale } from './locale';
import { getPartition } from './partition';
import { getPlurals } from './plurals';
import { getSubtags } from './subtags';
import { getTerritories } from './territories';
import { getUnits } from './units';
import { getWeekData } from './weekdata';
import { getZones } from './zones';

const OUTPUTS: { [x: string]: (data: any) => Code[] } = {
  aliases: getAliases,
  currencies: getCurrencies,
  distance: getDistance,
  locale: getLocale,
  partition: getPartition,
  plurals: getPlurals,
  subtags: getSubtags,
  territories: getTerritories,
  units: getUnits,
  weekdata: getWeekData,
  zones: getZones,
};

const DATA_FILES = [
  'aliases', 'currencyinfo', 'matching', 'metazones', 'plurals', 'subtags', 'symbols',
  'weekdata', 'zonedst'
];

const load = (): any => {
  const root = join(__dirname, '..', '..', '..', '..', 'temp');
  const data: any = {};
  DATA_FILES.forEach(name => {
    const path = join(root, `${name}.json`);
    console.warn(`Reading ${name}.json`);
    const raw = fs.readFileSync(path, { encoding: 'utf-8' });
    const tmp = JSON.parse(raw);
    Object.keys(tmp).forEach(key => {
      data[key] = tmp[key];
    });
  });
  return data;
};

const run = (args: yargs.Arguments) => {
  let keys = Object.keys(OUTPUTS).sort();
  if (args.which) {
    keys = args.which;
  }

  const data = load();

  // Path to root of monorepo
  const root = join(__dirname, '..', '..', '..', '..', '..', '..');
  const results = [];
  for (const key of keys) {
    const impl = OUTPUTS[key];
    for (const code of impl(data)) {
      const path = join(root, ...code.path);
      console.warn(`Writing ${path}`);
      fs.writeFileSync(path, code.source, { encoding: 'utf-8' });
    }
  }
};

export const codeOptions = (argv: yargs.Argv) =>
  argv.command('code', 'Generate code', (y: yargs.Argv) => y
    .option('w', { alias: 'which', type: 'array', description: 'Which files to generate' })
    .choices('w', Object.keys(OUTPUTS)),
    run);

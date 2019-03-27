import * as fs from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';
import { Code } from './util';

import { getAliases } from './aliases';
import { getCalendarPrefs } from './calendar';
import { getContexts } from './contexts';
import { getCurrencies } from './currencies';
import { getDayPeriods } from './dayperiods';
import { getDistance } from './distance';
import { getIdentifiers } from './identifiers';
import { getLocale } from './locale';
import { getPartition } from './partition';
import { getPlurals } from './plurals';
import { getSubtags } from './subtags';
import { getSystems } from './systems';
import { getTimeData } from './timedata';
import { getUnits } from './units';
import { getWeekData } from './weekdata';
import { getZones } from './zones';

const OUTPUTS: { [x: string]: (data: any) => Code[] } = {
  aliases: getAliases,
  calendar: getCalendarPrefs,
  contexts: getContexts,
  currencies: getCurrencies,
  dayperiods: getDayPeriods,
  distance: getDistance,
  identifiers: getIdentifiers,
  locale: getLocale,
  partition: getPartition,
  plurals: getPlurals,
  subtags: getSubtags,
  systems: getSystems,
  timedata: getTimeData,
  units: getUnits,
  weekdata: getWeekData,
  zones: getZones,
};

// Names of pre-processed data files
const DATA_FILES = [
  'aliases', 'currencyinfo', 'matching', 'metazones', 'plurals',
  'subtags', 'symbols', 'timedata', 'weekdata'
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

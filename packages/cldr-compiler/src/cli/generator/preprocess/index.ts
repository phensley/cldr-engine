import * as fs from 'fs';
import * as yargs from 'yargs';
import { join } from 'path';
import { getSupplemental } from '../../../cldr';

import { getCurrencyInfo } from './currency';
import { getMatching } from './matching';
import { getMetazones } from './metazones';
import { getPlurals } from './plurals';
import { getSubtags } from './subtags';
import { getSymbols } from './symbols';
import { getTimeData } from './timedata';
import { getZoneDST } from './zonedst';
import { getWeekData } from './weekdata';

const supplemental = getSupplemental();

const getAliases = (): any => supplemental.Aliases;

const OUTPUTS: { [x: string]: () => string } = {
  aliases: getAliases,
  currencyinfo: getCurrencyInfo,
  matching: getMatching,
  metazones: getMetazones,
  plurals: getPlurals,
  subtags: getSubtags,
  symbols: getSymbols,
  timedata: getTimeData,
  zonedst: getZoneDST,
  weekdata: getWeekData,
};

const save = (name: string, data: any): void => {
  const root = join(__dirname, '..', '..', '..', '..', 'temp');
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }
  const path = join(root, `${name}.json`);
  const json = JSON.stringify(data, undefined, 2);

  console.warn(`Writing ${path}`);
  fs.writeFileSync(path, json, { encoding: 'utf-8' });
};

const run = (args: yargs.Arguments): void => {
  let keys = Object.keys(OUTPUTS).sort();
  if (args.which) {
    keys = args.which;
  }
  for (const key of keys) {
    const impl = OUTPUTS[key];
    save(key, impl());
  }
};

export const preprocessOptions = (argv: yargs.Argv) =>
  argv.command('data', 'Preprocess data files', (y: yargs.Argv) => y
    .option('w', { alias: 'which', type: 'array', description: 'Which data' })
    .choices('w', Object.keys(OUTPUTS)),
    run);

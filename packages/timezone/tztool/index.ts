import * as yargs from 'yargs';
import * as fs from 'fs';
import * as filepath from 'path';

import { TZif } from './tzif';
import { setupTZDB } from './tzdb';
import { parseZIC } from './zic';
import { encodeZones } from './encode';

const VERSION = '2019a';

const runDumpJson = (argv: yargs.Arguments) => {
  const { file, pretty } = argv;
  const info = new TZif('None', file);
  console.log(info.json(pretty ? '  ' : undefined));
};

/**
 * Parse all zones and generate code.
 */
const runGenerate = (argv: yargs.Arguments) => {
  const { tag } = argv;
  const repo = setupTZDB(tag || VERSION);

  const tzdata = filepath.join(repo, 'tzdata.zi');
  const zonedir = filepath.join(repo, 'zones');

  const { links, zones } = parseZIC(tzdata);
  const encoded = encodeZones(zonedir, zones, links);

  const data = `/* Generated from tzdb version ${tag} */\n\n` + encoded;

  if (argv.out) {
    fs.writeFileSync(argv.out, data, { encoding: 'utf-8' });
  } else {
    console.log(data);
  }
};

/**
 * Run our zdump equivalent.
 */
const runZdump = (argv: yargs.Arguments) => {
  const { file, timestamps, years } = argv;
  const info = new TZif('None', file);
  const range = parseYears(years);
  console.log(info.zdump(timestamps, range));
};

const parseYears = (years: string | undefined): [number, number] | undefined => {
  if (!years) {
    return undefined;
  }
  const tmp = years.split(':').map(y => parseInt(y, 10));
  if (tmp.length === 2) {
    const [start, end] = tmp;
    return [jan1(start), dec31(end)];
  }
  const year = tmp[0];
  return [jan1(year), dec31(year)];
};

const jan1 = (year: number) => asUTC(new Date(year, 0, 1, 0, 0, 0));
const dec31 = (year: number) => asUTC(new Date(year, 11, 31, 0, 0, 0));
const asUTC = (d: Date) => (+d) - d.getTimezoneOffset() * 60000;

/**
 * Entry point for tztool command line.
 */
export const main = () => {
  yargs
  .command('generate', 'Generate code from tzif data', (y: yargs.Argv) => y
      .option('t', { alias: 'tag', description: 'Tag / version of the tzdb to build' })
      .option('o', { alias: 'out', description: 'Output file path' }),
      runGenerate)

  .command('json <file>', 'Dump tzif as JSON', (y: yargs.Argv) => y
      .positional('file', { description: 'Input file in TZif format' })
      .option('p', { alias: 'pretty', boolean: true }),
      runDumpJson)

  .command('zdump <file>', 'Dump tzif ala zdump', (y: yargs.Argv) => y
    .positional('file', { description: 'Input file in TZif format' })
    .option('t', { alias: 'timestamps', boolean: true, description: 'Include timestamps' })
    .option('y', { alias: 'years', type: 'string', description: 'Single year or range START:END' }),
    runZdump)

  .demandCommand(1, 'Please specify a command')
  .help('help')
  .option('h', { alias: 'help' })
  .parse();
};

import * as yargs from 'yargs';
import * as fs from 'fs';
import * as filepath from 'path';

import { TZif } from './tzif';
import { setupTZDB } from './tzdb';
import { parseZIC } from './zic';
import { encodeZones } from './encode';
import { parseZoneTab } from './zonetab';

const VERSION = '2025b';

interface JsonOptions {
  pretty: boolean;
}

const runDumpJson = (argv: yargs.ArgumentsCamelCase<JsonOptions & { file: string }>) => {
  const { file, pretty } = argv;
  const info = new TZif('None', file);
  console.log(info.json(pretty ? '  ' : undefined));
};

interface GenerateOptions {
  out: string;
  tag?: string;
}

/**
 * Parse all zones and generate code.
 */
const runGenerate = (argv: yargs.ArgumentsCamelCase<GenerateOptions>) => {
  const { tag } = argv;
  const repo = setupTZDB(tag || VERSION);

  const tzdata = filepath.join(repo, 'tzdata.zi');
  const zonedir = filepath.join(repo, 'zones');
  const zonetab = filepath.join(repo, 'zone1970.tab');

  const { links, stdoff, zones } = parseZIC(tzdata);
  const metadata = parseZoneTab(zonetab);
  const data = encodeZones(tag || VERSION, zonedir, zones, links, stdoff, metadata);

  if (argv.out) {
    fs.writeFileSync(argv.out, data, { encoding: 'utf-8' });
  } else {
    console.log(data);
  }
};

interface ZdumpOptions {
  timestamps: boolean;
  years?: string;
}

/**
 * Run our zdump equivalent.
 */
const runZdump = (argv: yargs.ArgumentsCamelCase<ZdumpOptions & { file: string }>) => {
  const { file, timestamps, years } = argv;
  const info = new TZif('None', file);
  const range = parseYears(years);
  console.log(info.zdump(timestamps, range));
};

const parseYears = (years: string | undefined): [number, number] | undefined => {
  if (!years) {
    return undefined;
  }
  const tmp = years.split(':').map((y) => parseInt(y, 10));
  if (tmp.length === 2) {
    const [start, end] = tmp;
    return [jan1(start), dec31(end)];
  }
  const year = tmp[0];
  return [jan1(year), dec31(year)];
};

const jan1 = (year: number) => asUTC(new Date(year, 0, 1, 0, 0, 0));
const dec31 = (year: number) => asUTC(new Date(year, 11, 31, 0, 0, 0));
const asUTC = (d: Date) => +d - d.getTimezoneOffset() * 60000;

/**
 * Entry point for tztool command line.
 */
export const main = () => {
  yargs
    .command(
      'generate',
      'Generate code from tzif data',
      (y: yargs.Argv) =>
        y
          .option('t', { type: 'string', description: 'Tag / version of the tzdb to build' })
          .option('o', { type: 'string', description: 'Output file path' })
          .alias('o', 'out')
          .alias('t', 'tag'),
      runGenerate,
    )

    .command(
      'json <file>',
      'Dump tzif as JSON',
      (y: yargs.Argv) =>
        y
          .positional('file', { type: 'string', description: 'Input file in TZif format' })
          .option('p', { boolean: true })
          .alias('p', 'pretty'),
      runDumpJson,
    )

    .command(
      'zdump <file>',
      'Dump tzif ala zdump',
      (y: yargs.Argv) =>
        y
          .positional('file', { type: 'string', description: 'Input file in TZif format' })
          .option('t', { boolean: true, description: 'Include timestamps' })
          .option('y', { type: 'string', description: 'Single year or range START:END' })
          .alias('t', 'timestamps')
          .alias('y', 'years'),
      runZdump,
    )

    .demandCommand(1, 'Please specify a command')
    .help('help')
    .option('h', { alias: 'help' })
    .parse();
};

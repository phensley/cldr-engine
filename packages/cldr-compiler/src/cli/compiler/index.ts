import * as yargs from 'yargs';
import { runPack } from './pack';
import { getPackageInfo } from './util';

/**
 * Entry point for cldr-compiler command line.
 */
export const main = () => {
  const pkg = getPackageInfo();
  yargs
    .command('pack', 'Compile resource packs', (y: yargs.Argv) => y
        .option('o', { alias: 'out', required: true, description: 'Output directory' })
        .option('l', { alias: 'lang', description: 'Comma-delimited list of languages to include' })
        .option('z', { description: 'Compress with gzip'}),
      runPack)
    .version(`compiler:${pkg.version} cldr:${pkg.cldrVersion}`)
    .demandCommand(1, 'Please specify a command')
    .help('help')
    .option('h', { alias: 'help' })
    .parse();
};

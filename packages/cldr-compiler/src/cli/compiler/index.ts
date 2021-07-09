import * as yargs from 'yargs';
import { runDump } from './dump';
import { runPack } from './pack';
import { runSchema } from './schema';
import { getProjectInfo } from './util';

/**
 * Entry point for cldr-compiler command line.
 */
export const main = () => {
  const pkg = getProjectInfo();
  yargs
    .command(
      'pack',
      'Compile resource packs',
      (y: yargs.Argv) =>
        y
          .option('o', { alias: 'out', required: true, description: 'Output directory' })
          .option('l', { alias: 'lang', description: 'Comma-delimited list of languages to include' })
          .option('p', { alias: 'patch', description: 'Patch data before generating resource packs' })
          .option('c', { alias: 'config', description: 'Config to customize generated resource packs' })
          .option('r', { alias: 'regions', description: 'Optional comma-delimited list of region codes to include' })
          .option('v', { alias: 'verbose', boolean: true, description: 'Verbose mode' }),
      runPack,
    )

    .command(
      'dump',
      'Dump a resource pack',
      (y: yargs.Argv) =>
        y
          .option('p', { alias: 'pack', required: true, description: 'Path to resource pack' })
          .option('c', { alias: 'config', description: 'Path to config used to generate resource pack' }),
      runDump,
    )

    .command(
      'schema',
      'Display the schema',
      (y: yargs.Argv) =>
        y
          .option('l', { alias: 'lang', description: 'Languages to include' })
          .option('r', { alias: 'regions', description: 'Regions to include' })
          .option('o', { alias: 'out', default: '.', description: 'Output directory' })
          .option('v', { alias: 'values', boolean: false, description: 'Include leaf values instead of counts' }),
      runSchema,
    )

    .version(`compiler:${pkg.version} cldr:${pkg.cldrVersion}`)
    .demandCommand(1, 'Please specify a command')
    .help('help')
    .option('h', { alias: 'help' })
    .parse();
};

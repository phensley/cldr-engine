import * as yargs from 'yargs';
import { Entry } from './types';
import { preprocessOptions } from './preprocess';
import { codeOptions } from './code';
import { schemaOptions } from './schema';

export const main = () => {
  const argv = yargs
    .option('n', { alias: 'dry-run', type: 'boolean', description: 'Dry run' });

  codeOptions(argv);
  preprocessOptions(argv);
  schemaOptions(argv);

  argv.demandCommand(1, 'Please specify a command')
    .help('help')
    .option('h', { alias: 'help' })
    .parse();
};

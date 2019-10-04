import * as yargs from 'yargs';
import { preprocessOptions } from './preprocess';
import { codeOptions } from './code';
import { schemaOptions } from './schema';
import { statsOptions } from './stats';

export const main = () => {
  const argv = yargs
    .option('n', { alias: 'dry-run', type: 'boolean', description: 'Dry run' });

  codeOptions(argv);
  preprocessOptions(argv);
  schemaOptions(argv);
  statsOptions(argv);

  argv.demandCommand(1, 'Please specify a command')
    .help('help')
    .alias('h', 'help')
    .parse();
};

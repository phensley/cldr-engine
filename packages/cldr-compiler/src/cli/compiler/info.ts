import yargs from 'yargs';
import { availableLocales } from '@phensley/cldr-core';
import { getProjectInfo } from './util';

export interface InfoArgs {}

export const runInfo = (_args: yargs.ArgumentsCamelCase<InfoArgs>) => {
  const pkg = getProjectInfo();
  console.log(`Library version ${pkg.version}`);
  console.log(`CLDR version ${pkg.cldrVersion}`);
  const locales = availableLocales();
  console.log(`Available locales: ${locales.length}`);
};

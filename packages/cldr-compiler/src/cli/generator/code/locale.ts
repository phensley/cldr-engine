import { Code, HEADER, NOLINT_MAXLINE } from './util';
import { availableLocales } from '../../../cldr';

export const getLocale = (_data: any): Code[] => {
  const locales = availableLocales().sort().join('|');

  let code = HEADER + NOLINT_MAXLINE;
  code += `export const availableLocalesRaw = '${locales}';\n`;

  return [
    Code.core(['locale', 'autogen.locales.ts'], code)
  ];
};

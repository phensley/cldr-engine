import { getSupplemental} from '../../../cldr';
import { objectToString, Code, HEADER, NOLINT_MAXLINE } from './util';

export const getAliases = (data: any): Code[] => {
  const supplemental = getSupplemental();

  const { languageAlias, scriptAlias, territoryAlias, zoneAlias } = supplemental.Aliases;

  const languages = objectToString(languageAlias);
  const scripts = objectToString(scriptAlias);
  const territories = objectToString(territoryAlias);

  const result: Code[] = [];

  let code = HEADER + NOLINT_MAXLINE;
  code += `export const languageAliasRaw = '${languages}';\n\n`;
  code += `export const scriptAliasRaw = '${scripts}';\n\n`;
  code += `export const territoryAliasRaw = '${territories}';\n`;

  result.push(Code.core(['locale', 'autogen.aliases.ts'], code));

  const zones = Object.keys(zoneAlias).sort().map(k => [k, zoneAlias[k]].join(':')).join('|');

  code = HEADER + NOLINT_MAXLINE;
  code += `export const zoneAliasRaw = '${zones}';\n`;

  result.push(Code.core(['systems', 'calendars', 'autogen.aliases.ts'], code));

  return result;
};

import { TZ } from '@phensley/timezone';
import { getSupplemental} from '../../../cldr';
import { objectToString, Code, HEADER, NOLINT_MAXLINE } from './util';

export const getAliases = (_data: any): Code[] => {
  const supplemental = getSupplemental();

  const { languageAlias, scriptAlias, territoryAlias, zoneAlias } = supplemental.Aliases;

  const languages = objectToString(languageAlias);
  const scripts = objectToString(scriptAlias);
  const territories = objectToString(territoryAlias);

  const result: Code[] = [];

  let code = HEADER + NOLINT_MAXLINE;
  code += `export const languageAliasRaw = '${languages}';\n\n`;
  code += `export const scriptAliasRaw = '${scripts}';\n`;

  result.push(Code.locale(['autogen.aliases.ts'], code));

  code = HEADER + NOLINT_MAXLINE;
  code += `export const territoryAliasRaw = '${territories}';\n`;

  result.push(Code.languagetag(['autogen.aliases.ts'], code));

  // Find time zone aliases that are not already handled in the @phensley/timezone package
  const zoneids = TZ.zoneIds();
  const zones = Object.keys(zoneAlias).filter(alias => {
    const zi = zoneids.indexOf(alias);
    if (zi !== -1) {
      // alias is in list of valid tzdb ids, ignore
      return false;
    }

    // if alias fails to resolve, include in this list
    return TZ.resolveId(alias) === undefined;
  }).sort().map(k => [k, zoneAlias[k]].join(':')).join('|');

  code = HEADER + NOLINT_MAXLINE;
  code += `export const zoneAliasRaw = '${zones}';\n`;

  result.push(Code.core(['systems', 'calendars', 'autogen.aliases.ts'], code));

  return result;
};

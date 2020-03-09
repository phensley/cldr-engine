import * as fs from 'fs';
import { join } from 'path';
import * as zlib from 'zlib';
import { TZ } from '@phensley/timezone';
import { getSupplemental } from '../../../cldr';
import { objectToString, Code, HEADER, NOLINT_MAXLINE } from './util';

/**
 * Split string into lines and split each line into a colon-delimited
 * key / value pair, and convert each group into an object.
 */
const parseSubtagBlock = (raw: string): { [x: string]: string } => {
  return raw.trim().split('\n').map(s => {
    const i = s.indexOf(':');
    return [s.substring(0, i), s.substring(i + 1)];
  }).reduce((o: { [x: string]: string }, [k, v]) => {
    o[k.trim()] = v.trim();
    return o;
  }, {});
};

const getIanaSubtags = () => {
  const path = join(__dirname, '..', '..', '..', '..', 'data', 'raw-iana-subtags.txt.gz');
  const raw = fs.readFileSync(path);
  const data = zlib.gunzipSync(raw).toString('utf-8');
  return data.split('%%').map(parseSubtagBlock).filter(r => r.Type);
};

export const getAliases = (_data: any): Code[] => {
  const supplemental = getSupplemental();

  const { languageAlias, scriptAlias, territoryAlias, zoneAlias } = supplemental.Aliases;

  const ianaSubtags = getIanaSubtags();

  const grandfathered = ianaSubtags.filter(r => r.Type === 'grandfathered').reduce((o, r) => {
    const tag = r.Tag;
    o[tag] = r['Preferred-Value'];
    return o;
  }, {});

  Object.keys(grandfathered).forEach(key => {
    if (languageAlias[key]) {
      delete languageAlias[key];
    }
  });

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

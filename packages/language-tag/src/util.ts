import { LanguageTagField as Tag } from './languagetag';
import { territoryAliasRaw } from './autogen.aliases';

/**
 * @public
 */
export type FastTag = (string | number)[];

export type FastTagPair = { type: FastTag; repl: FastTag };
export type LanguageAliasMap = { [x: string]: FastTagPair[] };
export type TerritoryAliasMap = { [x: string]: string[] };

const buildTerritoryAliasMap = (): TerritoryAliasMap => {
  return territoryAliasRaw.split('|').reduce((o: TerritoryAliasMap, e) => {
    const [k, v] = e.split(':');
    const regions = v.split(/\s+/g);
    o[k] = regions;
    return o;
  }, {});
};

let TERRITORY_ALIAS_MAP: TerritoryAliasMap;

const init = () => (TERRITORY_ALIAS_MAP = buildTerritoryAliasMap());

/**
 * Helper for the language tag parser to fix overlong region fields that may
 * or may not be variants.
 *
 * @internal
 */
export const replaceRegion = (region: string): string | undefined => {
  if (!TERRITORY_ALIAS_MAP) {
    init();
  }
  const aliases = TERRITORY_ALIAS_MAP[region];
  return aliases === undefined ? undefined : aliases[0];
};

/**
 * Substitute territory subtag aliases, if any.
 *
 * @public
 */
export const substituteRegionAliases = (dst: FastTag): void => {
  if (!TERRITORY_ALIAS_MAP) {
    init();
  }
  const region = dst[Tag.REGION];
  const replacement = region === Tag.REGION ? undefined : TERRITORY_ALIAS_MAP[region];
  if (replacement === undefined) {
    return;
  }

  // Hack: for now we just use the first region in the list.
  dst[Tag.REGION] = replacement[0];

  // TODO: get the best regions for this language / script combination, and if
  // one is found in the replacement set, use it. Otherwise use the first in the list.
};

export const stringToObject = (raw: string, d1: string, d2: string): { [x: string]: string } => {
  const o: { [x: string]: string } = {};
  for (const part of raw.split(d1)) {
    const [k, v] = part.split(d2);
    o[k] = v;
  }
  return o;
};

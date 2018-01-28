import { getExtensions, getSupplemental } from '../../../cldr';

const extensions = getExtensions();
const supplemental = getSupplemental();
const { LanguageMatching } = extensions;

type StringMap = { [x: string]: string[] };
type TerritorySet = { [x: string]: number };

/**
 * Get the territory hierarchy. We'll flatten this below.
 */
const getTerritories = () => {
  const territories: StringMap = {};
  const data = supplemental.TerritoryContainment;
  Object.keys(data).forEach(code => {
    if (code.indexOf('-') !== -1) {
      if (!code.endsWith('-status-grouping')) {
        return;
      }
      code = code.split('-')[0];
    }

    const children = data[code]._contains;
    let regions = territories[code] || [];
    regions = regions.concat(children);
    territories[code] = regions;
  });
  return territories;
};

/**
 * Recursively flatten a region and its children.
 */
const flattenRegion = (parent: string, flat: StringMap, data: any): string[] => {
  const countries: TerritorySet = {};
  const keys = data[parent] || [];
  keys.forEach((key: string) => {
    if (data[key]) {
      const children = flattenRegion(key, flat, data);
      flat[key] = children;
      children.forEach(k => countries[k] = 1);
    } else {
      countries[key] = 1;
    }
  });
  return Object.keys(countries).sort();
};

/**
 * Flatten the territory hierarchy.
 */
const flattenTerritories = () => {
  const data = getTerritories();
  const flat: StringMap = {};
  Object.keys(data).forEach(key => {
    flat[key] = flattenRegion(key, flat, data);
  });
  return flat;
};

/**
 * Get the list of language matching variables with regions expanded.
 */
const getMatchVariables = (territories: StringMap) => {
  const variables: StringMap = {};
  const { matchVariable } = LanguageMatching;
  Object.keys(matchVariable).forEach(key => {
    let regions: string[] = [];
    matchVariable[key].split(/\+/).forEach((code: string) => {
      const children = territories[code] || [code];
      regions = regions.concat(children);
    });
    variables[key] = regions;
  });
  return variables;
};

/**
 * Get the list of language matching rules.
 */
const getMatchRules = () => {
  const rules: any = [];
  const { languageMatch } = LanguageMatching;
  languageMatch.forEach((node: any) => {
    const rule = [
      node.desired,
      node.supported,
      node.desired.split(/_/).filter((e: string) => e === '*').length,
      parseInt(node.distance, 10),
      node.oneway === '1' ? 1 : 0,
    ];
    rules.push(rule);
  });
  return rules;
};

export const getMatching = (): any => {
  const { paradigmLocales } = LanguageMatching;
  const territoryContainment = flattenTerritories();
  const matchVariables = getMatchVariables(territoryContainment);
  const matchRules = getMatchRules();

  return {
    paradigmLocales: paradigmLocales.split(/\s+/),
    matchRules,
    matchVariables,
    territoryContainment,
  };
};

import { availableLocales, getMain, getSupplemental } from '../../../cldr';

/**
 * Copy an object's keys into a set.
 */
const addKeys = (obj: any, set: Set<string>) => Object.keys(obj).forEach(v => set.add(v));

const unique = (values: string[]): string[] => {
  const set = new Set<string>();
  values.forEach(v => set.add(v));
  return sorted(set);
};

/**
 * Sort an array and return it.
 */
const sorted = (set: Set<string>) => {
  const list: string[] = [];
  set.forEach(e => list.push(e));
  list.sort();
  return list;
};

/**
 * Extracts a set of CLDR symbols by scanning the entire dataset.
 */
export const getSymbols = (): any => {
  const locales = availableLocales();

  // Containers for extracted values.
  const timeZoneIds = new Set();
  const metaZoneIds = new Set();
  const contextTransforms = new Set();
  const currencies = new Set();
  const languages = new Set();
  const scripts = new Set();
  const territories = new Set();
  const unitsRaw = new Set();

  locales.forEach(lang => {
    console.warn(`Scanning '${lang}'..`);

    // Add keys for nested objects to their corresponding sets.
    const main = getMain(lang);

    addKeys(main.ContextTransforms.contextTransforms, contextTransforms);
    addKeys(main.Currencies.currencyIds, currencies);
    addKeys(main.Units.unitIds, unitsRaw);
    addKeys(main.Names.languages.displayName, languages);
    addKeys(main.Names.scripts.displayName, scripts);
    addKeys(main.Territories.territories, territories);
    addKeys(main.TimeZoneNames.timeZoneIds, timeZoneIds);
    addKeys(main.TimeZoneNames.metaZoneIds, metaZoneIds);
  });

  const unitCategories = unique(sorted(unitsRaw).map(u => u.split('-')[0]));
  return {
    metaZoneIds: sorted(metaZoneIds),
    timeZoneIds: sorted(timeZoneIds),
    units: sorted(unitsRaw),
    unitCategories: unitCategories,
    contextTransforms: sorted(contextTransforms),
    currencies: sorted(currencies),
    languages: sorted(languages),
    scripts: sorted(scripts),
    territories: sorted(territories),
  };
};

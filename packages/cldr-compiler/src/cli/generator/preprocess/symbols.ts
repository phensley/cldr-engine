import { availableLocales, getMain } from '../../../cldr';

/**
 * Copy an object's keys into a set.
 */
const addKeys = (obj: any, set: Set<string>) => Object.keys(obj || {}).forEach((v) => set.add(v));

const nestedKeys = (obj: any): any => {
  const r: any = {};
  Object.keys(obj || {}).forEach((k) => {
    for (const key of Object.keys(obj[k])) {
      r[key] = 1;
    }
  });
  return r;
};

const unique = (values: string[]): string[] => {
  const set = new Set<string>();
  values.forEach((v) => set.add(v));
  return sorted(set);
};

/**
 * Sort an array and return it.
 */
const sorted = (set: Set<string>) => {
  const list: string[] = [];
  set.forEach((e) => list.push(e));
  list.sort();
  return list;
};

/**
 * Extracts a set of CLDR symbols by scanning the entire dataset.
 */
export const getSymbols = (): any => {
  const locales = availableLocales();

  // Containers for extracted values.
  const timeZoneIds = new Set<string>();
  const metaZoneIds = new Set<string>();
  const contextTransforms = new Set<string>();
  const currencies = new Set<string>();
  const languages = new Set<string>();
  const scripts = new Set<string>();
  const territories = new Set<string>();
  const unitsRaw = new Set<string>();

  const gregorianAvailableFormats = new Set<string>();
  const buddhistAvailableFormats = new Set<string>();
  const persianAvailableFormats = new Set<string>();
  const japaneseAvailableFormats = new Set<string>();

  const gregorianPluralFormats = new Set<string>();
  const buddhistPluralFormats = new Set<string>();
  const persianPluralFormats = new Set<string>();
  const japanesePluralFormats = new Set<string>();

  const gregorianIntervalFormats = new Set<string>();
  const buddhistIntervalFormats = new Set<string>();
  const persianIntervalFormats = new Set<string>();
  const japaneseIntervalFormats = new Set<string>();

  locales.forEach((lang) => {
    console.warn(`Scanning '${lang}'..`);

    // Add keys for nested objects to their corresponding sets.
    const main = getMain(lang);

    addKeys(main.ContextTransforms.contextTransforms, contextTransforms);
    addKeys(main.Currencies.currencyIds, currencies);
    addKeys(main.Units.unitIds, unitsRaw);
    addKeys(nestedKeys(main.Names.languages.displayName), languages);
    addKeys(nestedKeys(main.Names.scripts.displayName), scripts);
    addKeys(main.Territories.territories, territories);
    addKeys(main.TimeZoneNames.timeZoneIds, timeZoneIds);
    addKeys(main.TimeZoneNames.metaZoneIds, metaZoneIds);

    addKeys(main.Gregorian.availableFormats, gregorianAvailableFormats);
    addKeys(main.Buddhist.availableFormats, buddhistAvailableFormats);
    addKeys(main.Persian.availableFormats, persianAvailableFormats);
    addKeys(main.Japanese.availableFormats, japaneseAvailableFormats);

    addKeys(nestedKeys(main.Gregorian.pluralFormats), gregorianPluralFormats);
    addKeys(nestedKeys(main.Buddhist.pluralFormats), buddhistPluralFormats);
    addKeys(nestedKeys(main.Persian.pluralFormats), persianPluralFormats);
    addKeys(nestedKeys(main.Japanese.pluralFormats), japanesePluralFormats);

    addKeys(main.Gregorian.intervalFormats, gregorianIntervalFormats);
    addKeys(main.Buddhist.intervalFormats, buddhistIntervalFormats);
    addKeys(main.Persian.intervalFormats, persianIntervalFormats);
    addKeys(main.Japanese.intervalFormats, japaneseIntervalFormats);
  });

  const unitCategories = unique(sorted(unitsRaw).map((u) => u.split('-')[0]));

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

    gregorianAvailableFormats: sorted(gregorianAvailableFormats),
    buddhistAvailableFormats: sorted(buddhistAvailableFormats),
    persianAvailableFormats: sorted(persianAvailableFormats),
    japaneseAvailableFormats: sorted(japaneseAvailableFormats),

    gregorianPluralFormats: sorted(gregorianPluralFormats),
    buddhistPluralFormats: sorted(buddhistPluralFormats),
    persianPluralFormats: sorted(persianPluralFormats),
    japanesePluralFormats: sorted(japanesePluralFormats),

    gregorianIntervalFormats: sorted(gregorianIntervalFormats),
    buddhistIntervalFormats: sorted(buddhistIntervalFormats),
    persianIntervalFormats: sorted(persianIntervalFormats),
    japaneseIntervalFormats: sorted(japaneseIntervalFormats),
  };
};

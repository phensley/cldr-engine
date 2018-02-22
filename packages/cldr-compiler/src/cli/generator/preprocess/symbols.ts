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
  const numberSymbols = new Set();
  const currencies = new Set();
  const territories = new Set();
  const unitsRaw = new Set();

  // TODO: once non-gregorian calendars are supported we should namespace these
  const availableFormats = new Set();
  const intervalFormats = new Set();

  locales.forEach(lang => {
    console.warn(`Scanning '${lang}'..`);

    // Add keys for nested objects to their corresponding sets.
    const main = getMain(lang);
    addKeys(main.TimeZoneNames.timeZones, timeZoneIds);
    addKeys(main.TimeZoneNames.metaZones, metaZoneIds);
    addKeys(main.Currencies, currencies);
    addKeys(main.Numbers.symbols, numberSymbols);
    addKeys(main.Territories.territories, territories);
    addKeys(main.Gregorian.availableFormats, availableFormats);
    addKeys(main.Gregorian.intervalFormats, intervalFormats);
    addKeys(main.Units.names, unitsRaw);
  });

  const unitCategories = unique(sorted(unitsRaw).map(u => u.split('-')[0]));
  return {
    metaZoneIds: sorted(metaZoneIds),
    timeZoneIds: sorted(timeZoneIds),
    units: sorted(unitsRaw),
    unitCategories: unitCategories,
    currencies: sorted(currencies),
    numberSymbols: sorted(numberSymbols),
    availableFormats: sorted(availableFormats),
    intervalFormats: sorted(intervalFormats),
    territories: sorted(territories),
  };
};

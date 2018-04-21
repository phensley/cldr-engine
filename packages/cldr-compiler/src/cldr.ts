/// <reference path="./typings.d.ts" />

/**
 * Flattens, filters and normalizes the raw CLDR JSON hierarchy.
 */

import * as fs from 'fs';
import { join } from 'path';
import * as cldr from 'cldr-data';
import * as L from 'partial.lenses';

import {
  transformCalendar,
  transformCurrencies,
  transformDatefields,
  transformNumbers,
  transformRegion,
  transformTimezones,
  transformUnits
} from './data';

const get = (optic: any) => (o: any) => L.get(optic, o);

const _widthTemplate = { 'wide': [], 'narrow': [], 'abbreviated': [], 'short': [] };

const _alias = ['metadata', 'alias'];
const _formats = L.pickIn({ 'format': _widthTemplate, 'stand-alone': _widthTemplate });

const _chinese = ['dates', 'calendars', 'chinese'];
const _languageMatching = ['languageMatching', 'written_new'];
const _pruneUnitFormats = L.remove(L.props('per', 'coordinateUnit'));
const _sizeProps = L.props('short', 'medium', 'long', 'full');
const _timeZoneNames = ['dates', 'timeZoneNames'];

const _dateFields = ['dates', 'fields'];
const _relativeTypes = [
  'relative-type--1',
  'relative-type-0',
  'relative-type-1',
  'relativeTime-type-future',
  'relativeTime-type-past'
];

const isTimeZone = (o: any) => typeof o === 'object' &&
  ('exemplarCity' in o || 'short' in o || 'long' in o);

const isTimeZoneAlias = (o: any) => '_replacement' in o;

/**
 * Assign all properties from each src object to the destination and return it.
 */
const assign = (dst: any, ...src: any[]): any => {
  for (const s of src) {
    for (const k of Object.keys(s)) {
      dst[k] = s[k];
    }
  }
  return dst;
};

/**
 * Flattens the time zone keys, pulling out just the format:
 *  { 'Pacific/Honolulu': { short: { generic: ... } } }
 */
const flattenTimeZones = (obj: any): any => {
  const inner = (o: any, path: string[] = []): any =>
    isTimeZone(o) ? [{ [path.join('/')]: o }] :
    [].concat(...Object.keys(o).map(k => inner(o[k], path.concat([k]))));
  return assign({}, ...inner(obj));
};

/**
 * Flatten a nested alias object, pulling up the child '_replacement' key.
 */
const flattenAlias = (obj: any) => {
  return Object.keys(obj).reduce((o: any, k: string): any => {
    o[k] = obj[k]._replacement;
    return o;
  }, {});
};

/**
 * Flatten the time zone aliases, pulling out the replacement:
 *   { 'Africa/Timbuktu': 'Africa/Bamako' }
 */
const flattenZoneAliases = (obj: any) => {
  const inner = (o: any, path: string[] = []): any =>
    isTimeZoneAlias(o) ? [{ [path.join('/')]: o._replacement }] :
    [].concat(...Object.keys(o).map(k => inner(o[k], path.concat([k]))));
  return assign({}, ...inner(obj));
};

/**
 * Flatten the timezone to metazone mapping.
 */
const flattenMetaZones = (obj: any): any => {
  const inner = (o: any, path: string[] = []): any =>
    Array.isArray(o) ? [{ [path.join('/')]: o }] :
    [].concat(...Object.keys(o).map(k => inner(o[k], path.concat([k]))));
  return assign({}, ...inner(obj));
};

/**
 * Convert the hour field to uppercase, to allow us to index it with an enum.
 */
const fixIntervals = (obj: any) => {
  const res: any = {};
  Object.keys(obj).forEach(skel => {
    const outer = obj[skel];
    const inner: any = {};
    Object.keys(outer).forEach(field => {
      const key = field === 'h' ? 'H' : field;
      inner[key] = outer[field];
    });
    res[skel] = inner;
  });
  return res;
};

/**
 * Rename era formats from 'eraNames' to 'names', etc.
 */
const fixEras = (obj: any) => {
  if (obj === undefined) {
    return {};
  }
  return Object.keys(obj).reduce((o: any, key) => {
    const k = key.toLowerCase().substring(3);
    o[k] = obj[key];
    return o;
  }, {});
};

/**
 * Get the full unit names.
 */
const getUnitNames = (obj: any) => {
  return Object.keys(obj).reduce((o: any, k) => {
    o[k] = {};
    return o;
  }, {});
};

/**
 * Split the category off the unit names.
 */
const fixUnitNames = (obj: any) => {
  return Object.keys(obj).reduce((o: any, key) => {
    const index = key.indexOf('-');
    const name = key.substring(index + 1);
    o[name] = obj[key];
    return o;
  }, {});
};

/**
 * Aliases
 */
const Aliases = {
  languageAlias: get([_alias, 'languageAlias', flattenAlias]),
  scriptAlias: get([_alias, 'scriptAlias', flattenAlias]),
  territoryAlias: get([_alias, 'territoryAlias', flattenAlias]),
  variantAlias: get([_alias, 'variantAlias', flattenAlias]),
  zoneAlias: get([_alias, 'zoneAlias', flattenZoneAliases])
};

const _orientation = ['layout', 'orientation'];

const LAYOUT_KEY: any = {
  'left-to-right': 'ltr',
  'right-to-left': 'rtl',
  'top-to-bottom': 'ttb',
  'bottom-to-top': 'btt'
};

const layoutKey = (k: string): string => {
  return LAYOUT_KEY[k] || k;
};

/**
 * Layout
 */
const Layout = {
  characterOrder: get([_orientation, 'characterOrder', layoutKey]),
  lineOrder: get([_orientation, 'lineOrder', layoutKey])
};

const relativeFields = [
  'year', 'quarter', 'month', 'week', 'day',
  'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
  'hour', 'minute', 'second'
];

const relativeKey = (k: string) => [k, `${k}-short`, `${k}-narrow`];

// Restructure relative times under 'short', 'narrow', 'wide' subkeys
const relativeTimes = (obj: any): any => {
  const r: any = {};
  relativeFields.forEach(key => {
    const o: any = {};
    ['', 'short', 'narrow'].forEach(ext => {
      const k = `${key}${ext ? '-' : ''}${ext}`;
      o[ext || 'wide'] = obj[k];
    });
    r[key] = o;
  });
  return r;
};

/**
 * Date fields, relative times.
 */
const DateFields = {
  relativeTimes: get([_dateFields, relativeTimes]),
};

const coreCalendarSchema = (name: string) => {
  const prefix = (...keys: string[]) => ['dates', 'calendars', name, ...keys];
  const intervals = prefix('dateTimeFormats', 'intervalFormats');

  return {
    availableFormats: get(prefix('dateTimeFormats', 'availableFormats')),
    dateFormats: get(prefix('dateFormats', ..._sizeProps)),
    dayPeriods: get(prefix('dayPeriods', ..._formats)),
    dateTimeFormats: get(prefix('dateTimeFormats', ..._sizeProps)),
    eras: get([prefix('eras'), fixEras]),
    intervalFormats: get([L.compose(intervals, L.remove(L.props('intervalFormatFallback'))), fixIntervals]),
    intervalFormatFallback: get(L.compose(intervals, 'intervalFormatFallback')),
    months: get(prefix('months', ..._formats)),
    quarters: get(prefix('quarters', ..._formats)),
    timeFormats: get(prefix('timeFormats', ..._sizeProps)),
    weekdays: get(prefix('days', ..._formats))
  };
};

const buddhist = (...keys: string[]) => ['dates', 'calendars', 'buddhist', ...keys];

const Buddhist = {
  ...coreCalendarSchema('buddhist'),
};

const chinese = (...keys: string[]) => ['dates', 'calendars', 'chinese', ...keys];

/**
 * Chinese calendar data.
 */
const Chinese = {
  ...coreCalendarSchema('chinese'),
  cyclicDayParts: get(chinese('cyclicNameSets', 'dayParts', _formats)),
  cyclicDays: get(chinese('cyclicNameSets', 'days', _formats)),
  solarTerms: get(chinese('solarTerms', _formats)),
  zodiacs: get(chinese('cyclicNameSets', 'zodiacs', _formats))
};

const gregorian = (...keys: string[]) => ['dates', 'calendars', 'gregorian', ...keys];

/**
 * Gregorian calendar data.
 */
const Gregorian = {
  ...coreCalendarSchema('gregorian'),
};

const hebrew = (...keys: string[]) => ['dates', 'calendars', 'hebrew', ...keys];

/**
 * Hebrew calendar data.
 */
const Hebrew = {
  ...coreCalendarSchema('hebrew'),
};

const japanese = (...keys: string[]) => ['dates', 'calendars', 'japanese', ...keys];

/**
 * Japanese calendar data.
 */
const Japanese = {
  ...coreCalendarSchema('japanese'),
};

const persian = (...keys: string[]) => ['dates', 'calendars', 'persian', ...keys];

/**
 * Persian calendar data.
 */
const Persian = {
  ...coreCalendarSchema('persian'),
};

/**
 * Patch: language matching.
 */
const LanguageMatching = {
  languageMatch: get([_languageMatching, 'languageMatch']),
  matchVariable: get([_languageMatching, 'matchVariable']),
  paradigmLocales: get([_languageMatching, 'paradigmLocales'])
};

const listPatternKeys = [
  ['standard', 'and'],
  ['standard-short', 'andShort'],
  ['or', 'or'],
  ['unit', 'unitLong'],
  ['unit-narrow', 'unitNarrow'],
  ['unit-short', 'unitShort']
];

const listPattern = (o: any): any => {
  const res: any = {};
  listPatternKeys.forEach(([ext, key]) => {
    const k = `listPattern-type-${ext}`;
    const v = o[k];
    v['two'] = v['2'];
    res[key] = v;
  });
  return res;
};

/**
 * Metazone data.
 */
const MetaZones = {
  ranges: get(['metaZones', 'metazoneInfo', 'timezone', flattenMetaZones]),
};

const numberSystemKeys = [
  'currencyFormats', 'decimalFormats', 'percentFormats', 'scientificFormats', 'symbols'
];

/**
 * Restructure the formats by numbering system.
 */
const numberSystemInfo = (o: any): any => {
  const r: any = {};

  // Get unique numbering system keys in this locale
  const systems = new Set();
  Object.keys(o).forEach(k => {
    if (k.startsWith('decimalFormats-numberSystem')) {
      const system = k.split('-')[2];
      systems.add(system);
    }
  });

  // Group formats by numbering system
  systems.forEach(name => {
    const system: any = {};
    numberSystemKeys.forEach(k => {
      system[k] = o[`${k}-numberSystem-${name}`];
    });
    r[name] = system;
  });

  return r;
};

const numberSystems = (o: any): any => {
  const def = o.defaultNumberingSystem;
  const other = o.otherNumberingSystems;
  const native = other.native || def;
  return {
    default: def,
    native,
    finance: other.finance || def,
    traditional: other.traditional || native
  };
};

/**
 * Number and currency formatting data.
 */
const Numbers = {
  numberSystem: get(['numbers', numberSystemInfo]),
  numberSystems: get(['numbers', numberSystems]),
  minimumGroupingDigits: get(['numbers', 'minimumGroupingDigits']),
};

/**
 * Time zone data.
 */
const TimeZoneNames = {
  gmtFormat: get([_timeZoneNames, 'gmtFormat']),
  gmtZeroFormat: get([_timeZoneNames, 'gmtZeroFormat']),
  hourFormat: get([_timeZoneNames, 'hourFormat']),
  regionFormat: get([_timeZoneNames, 'regionFormat']),
  metaZones: get([_timeZoneNames, 'metazone']),
  timeZones: get([_timeZoneNames, 'zone', flattenTimeZones])
};

/**
 * Unit names and formats.
 */
const Units = {
  names: get(['units', 'long', _pruneUnitFormats, getUnitNames]),

  long: get(['units', 'long', _pruneUnitFormats, fixUnitNames]),
  longPer: get(['units', 'long', 'per']),
  longCoordinate: get(['units', 'long', 'coordinateUnit']),

  short: get(['units', 'short', _pruneUnitFormats, fixUnitNames]),
  shortPer: get(['units', 'short', 'per']),
  shortCoordinate: get(['units', 'short', 'coordinateUnit']),

  narrow: get(['units', 'narrow', _pruneUnitFormats, fixUnitNames]),
  narrowPer: get(['units', 'narrow', 'per']),
  narrowCoordinate: get(['units', 'narrow', 'coordinateUnit'])
};

/**
 * Week data.
 */
const WeekData = {
  minDays: get(['weekData', 'minDays']),
  firstDay: get(['weekData', 'firstDay']),
  weekendStart: get(['weekData', 'weekendStart']),
  weekendEnd: get(['weekData', 'weekendEnd'])
};

/**
 * Iterate over keys in the group, populating an object with the values
 * retrieved by evaluating each lens property.
 */
const convert = (group: any, root: any) => {
  return Object.keys(group).reduce((o: any, k: string) => {
    o[k] = group[k](root);
    return o;
  }, {});
};

/**
 * Load the cldr data from the given path. Raise an error if the path
 * does not exist, unless the optional flag is true.
 */
export const load = (path: string, optional = false) => {
  try {
    return cldr(path);
  } catch (e) {
    if (!optional) {
      throw e;
    }
    return {};
  }
};

/**
 * Flattens and exports the main hierarchy for a given language.
 */
export const getMain = (language: string, transform: boolean = true) => {
  const access = (group: {}, fileName: string, optional = false, transformer?: (o: any) => any) => {
    const data = load(`main/${language}/${fileName}`, optional);
    const root = L.get(['main', language], data);
    const converted = convert(group, root);
    return transform && transformer ? transformer(converted) : converted;
  };

  return {
    // Chinese: access(Chinese, 'ca-chinese'),
    Hebrew: access(Hebrew, 'ca-hebrew'),
    Layout: access(Layout, 'layout'),
    Numbers: access(Numbers, 'numbers', false, transformNumbers),

    Names: {
      languages: {
        ...access({ displayName: get(['localeDisplayNames', 'languages']) }, 'languages')
      },
      scripts: {
        ...access({ displayName: get(['localeDisplayNames', 'scripts']) }, 'scripts'),
      },
      regions: {
        ...access({ displayName: get(['localeDisplayNames', 'territories']) }, 'territories',
          false, transformRegion)
      }
    },

    ...access({ Characters: get(['characters']) }, 'characters'),
    ...access({ ContextTransforms: get(['contextTransforms']) }, 'contextTransforms', true),
    ...access({ Currencies: get(['numbers', 'currencies']) }, 'currencies', false, transformCurrencies),
    ...access({ ListPatterns: get(['listPatterns', listPattern]) }, 'listPatterns'),
    ...access({ Territories: get(['localeDisplayNames']) }, 'territories'),

    DateFields: access(DateFields, 'dateFields', false, transformDatefields),
    TimeZoneNames: access(TimeZoneNames, 'timeZoneNames', false, transformTimezones),
    Units: access(Units, 'units', false, transformUnits),
    Buddhist: access(Buddhist, 'ca-buddhist', false, transformCalendar),
    Chinese: access(Chinese, 'ca-chinese'),
    Gregorian: access(Gregorian, 'ca-gregorian', false, transformCalendar),
    Japanese: access(Japanese, 'ca-japanese', false, transformCalendar),
    Persian: access(Persian, 'ca-persian', false, transformCalendar),
  };
};

/**
 * Flattens and exports the supplemental hierarchy.
 */
export const getSupplemental = () => {
  const access = (group: {}, fileName: string) => {
    const data = load(`supplemental/${fileName}`);
    const root = L.get(['supplemental'], data);
    return convert(group, root);
  };

  return {
    Aliases: access(Aliases, 'aliases'),
    MetaZones: access(MetaZones, 'metaZones'),
    WeekData: access(WeekData, 'weekData'),

    ...access({ CalendarPreferences: get(['calendarPreferenceData']) }, 'calendarPreferenceData'),
    ...access({ Cardinals: get(['plurals-type-cardinal']) }, 'plurals'),
    ...access({ CurrencyFractions: get(['currencyData', 'fractions']) }, 'currencyData'),
    ...access({ DayPeriods: get(['dayPeriodRuleSet']) }, 'dayPeriods'),
    ...access({ Ordinals: get(['plurals-type-ordinal']) }, 'ordinals'),
    ...access({ LikelySubtags: get(['likelySubtags']) }, 'likelySubtags'),
    ...access({ NumberingSystems: get(['numberingSystems']) }, 'numberingSystems'),
    ...access({ TerritoryContainment: get(['territoryContainment']) }, 'territoryContainment'),
    ...access({ TimeData: get(['timeData']) }, 'timeData')
  };
};

/**
 * Supplemental files that live at the top level.
 */
export const getOther = () => {
  const access = (group: {}, fileName: string) => {
    const root = load(fileName);
    return convert(group, root);
  };

  return {
    ...access({ DefaultContent: get(['defaultContent']) }, 'defaultContent')
  };
};

/**
 * Exports all extensions / patches.
 */
export const getExtensions = () => {

  const access = (group: {}, filename: string) => {
    const path = join(__dirname, '..', 'data', 'patches', `${filename}.json`);
    const data = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
    const root = L.get(['supplemental'], data);
    return convert(group, root);
  };

  return {
    LanguageMatching: access(LanguageMatching, 'languageMatching-fix'),
    ...access({ PluralRanges: get(['pluralRanges']) }, 'pluralRanges-fix')
  };
};

/**
 * Available locales.
 */
export const availableLocales = () => cldr.availableLocales.filter(v => v !== 'root');

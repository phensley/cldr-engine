import { sortSet, Code } from './util';

const identifiers = (symbols: string[]): string[] => {
  const temp = symbols.map((s: string) => s.split('-')[0]);
  return sortSet(new Set(temp));
};

const unitNames = (symbols: string[]) => {
  return symbols.map(s => {
    const i = s.indexOf('-');
    return s.substring(i + 1);
  }).sort();
};

// These are all of the number systems defined in the numbers schema.
const NUMBER_SYSTEM_NAME = [
  'arab',
  'arabext',
  'beng',
  'deva',
  'gujr',
  'guru',
  'hanidec',
  'khmr',
  'knda',
  'laoo',
  'latn',
  'mlym',
  'mymr',
  'tamldec',
  'telu',
  'thai'
];

export const getConfig = (data: any): Code[] => {
  const languages = identifiers(data.languages);
  const scripts = identifiers(data.scripts);
  const regions = identifiers(data.territories);
  const units = unitNames(data.units);

  const obj = {
    'calendars': ['gregorian', 'buddhist', 'japanese', 'persian'],
    'language-id': languages,
    'script-id': scripts,
    'region-id': regions,
    'number-system-name': NUMBER_SYSTEM_NAME,
    'unit-id': units,
  };

  const code = JSON.stringify(obj);
  return [
    Code.top(['packages', 'cldr', 'src', 'config.json'], code)
  ];
};

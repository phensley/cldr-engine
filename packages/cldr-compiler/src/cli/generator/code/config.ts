import { sortSet, Code, HEADER, NOLINT_MAXLINE } from './util';

const identifiers = (symbols: string[]): string[] => {
  const temp = symbols.map((s: string) => s.split('-')[0]);
  return sortSet(new Set(temp));
};

const unitNames = (symbols: string[]) => {
  return symbols.map(s => {
    const i = s.indexOf('-');
    const name = s.substring(i + 1);
    return name === 'generic' ? 'temperature' : name;
  }).sort();
};

const indent = (d: number) => ' '.repeat(d * 2);

const objectToCode = (o: any, depth: number = 1): string => {
  let r = '';
  if (typeof o === 'string') {
    r += `'${o}'`;

  } else if (Array.isArray(o)) {
    const vals = o.map(v => objectToCode(v, depth + 1)).join(`, `);
    r += `[\n${vals ? indent(depth) : ''}${vals}\n${indent(depth - 1)}]`;

  } else {
    const x = indent(depth);
    r += `{\n`;
    const keys = Object.keys(o);
    for (let i = 0; i < keys.length; i++) {
      if (i > 0) {
        r += ',\n';
      }
      const key = keys[i];
      const val = o[key];
      r += `${x}'${key}': ${objectToCode(val, depth + 1)}`;
    }
    r += `\n${indent(depth - 1)}}`;
  }
  return r;
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
  const languages = sortSet(new Set(data.languages));
  const scripts = sortSet(new Set(data.scripts));
  const regions = identifiers(data.territories);
  const units = unitNames(data.units);
  const { currencies, timeZoneIds } = data;

  const obj = {
    'calendars': ['gregory', 'buddhist', 'japanese', 'persian'],
    'language-id': languages,
    'script-id': scripts,
    'region-id': regions,
    'currency-id': currencies,

    'gregorian-available-format': data.gregorianAvailableFormats,
    'gregorian-plural-format': data.gregorianPluralFormats,
    'gregorian-interval-format': data.gregorianIntervalFormats,

    'buddhist-available-format': data.buddhistAvailableFormats,
    'buddhist-plural-format': data.buddhistPluralFormats,
    'buddhist-interval-format': data.buddhistIntervalFormats,

    'persian-available-format': data.persianAvailableFormats,
    'persian-plural-format': data.persianPluralFormats,
    'persian-interval-format': data.persianIntervalFormats,

    'japanese-available-format': data.japaneseAvailableFormats,
    'japanese-plural-format': data.japanesePluralFormats,
    'japanese-interval-format': data.japaneseIntervalFormats,

    'number-system-name': NUMBER_SYSTEM_NAME,
    'unit-id': units,
    'timezone-id': timeZoneIds
  };

  let code = HEADER + NOLINT_MAXLINE;
  code += `import { SchemaConfig } from '@phensley/cldr-core';\n\n`;
  code += `export const config: SchemaConfig = ${objectToCode(obj)};\n`;

  const json = JSON.stringify(obj);
  return [
    Code.top(['packages', 'cldr', 'src', 'config.ts'], code),
    Code.top(['packages', 'cldr-compiler', 'src', 'cli', 'compiler', 'config.json'], json)
  ];
};

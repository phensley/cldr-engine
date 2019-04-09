import { origin, KeyIndex, KeyIndexMap, Origin } from '../types';
import { BUDDHIST, BUDDHIST_INDICES } from './buddhist';
// import { CALENDAR_INDICES, CALENDAR_VALUES } from './calendars';
import { CALENDAR_INDICES } from './calendars';
// import { CURRENCIES, CURRENCIES_INDICES, CURRENCIES_VALUES } from './currencies';
import { CURRENCIES } from './currencies';
import { DATEFIELDS, DATEFIELDS_INDICES } from './datefields';
import { CONTEXT_TRANSFORM, GENERAL_INDICES, LAYOUT, LIST_PATTERNS } from './general';
import { GREGORIAN, GREGORIAN_INDICES } from './gregorian';
import { JAPANESE, JAPANESE_INDICES } from './japanese';
import { NAMES } from './names';
// import { NUMBERS, NUMBERS_INDICES, NUMBERS_VALUES } from './numbers';
import { NUMBERS, NUMBERS_INDICES } from './numbers';
import { PERSIAN, PERSIAN_INDICES } from './persian';
// import { TIMEZONE, TIMEZONE_INDICES, TIMEZONE_VALUES } from './timezones';
import { TIMEZONE, TIMEZONE_INDICES } from './timezones';
// import { UNITS, UNITS_INDICES, UNITS_VALUES } from './units';
import { UNITS } from './units';

// import { AltIndex, PluralIndex, Schema } from '../schema';
import { AltIndex, PluralIndex } from '../schema';

// const CODE = [
//   NAMES,
//   NUMBERS,
//   DATEFIELDS,
//   LAYOUT,
//   LIST_PATTERNS,
//   BUDDHIST,
//   GREGORIAN,
//   JAPANESE,
//   PERSIAN,
//   TIMEZONE,
//   CURRENCIES,
//   UNITS,
//   CONTEXT_TRANSFORM
// ];

const INDICES = {
  'alt-key': AltIndex,
  'plural-key': PluralIndex,

  ...CALENDAR_INDICES,
  // ...BUDDHIST_INDICES,
  // ...GREGORIAN_INDICES,
  // ...JAPANESE_INDICES,
  // ...PERSIAN_INDICES,

  // ...CURRENCIES_INDICES,
  ...DATEFIELDS_INDICES,
  ...GENERAL_INDICES,
  // ...NAMES_INDICES,
  ...NUMBERS_INDICES,
  ...TIMEZONE_INDICES,
  // ...UNITS_INDICES
};

// const VALUES = {
//   ...CALENDAR_VALUES,
//   // ...CURRENCIES_VALUES,
//   ...NUMBERS_VALUES,
//   ...TIMEZONE_VALUES,
//   // ...UNITS_VALUES
// };

// export const ORIGIN: Origin = origin(CODE, INDICES, VALUES);

export interface SchemaConfig {
  /**
   * Calendar types to include.
   *
   * Ex: ['gregorian', 'buddhist', 'japanese', 'persian']
   */
  calendars?: string[];

  /**
   * Currency codes to include.
   *
   * Ex: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', ... ]
   */
  ['currency-id']?: string[];

  /**
   * Language identifiers to include.
   */
  ['language-id']?: string[];

  /**
   * Script identifiers to include.
   */
  ['script-id']?: string[];

  /**
   * Region identifiers to include.
   */
  ['region-id']?: string[];

  /**
   * Units to include.
   *
   * Ex: ['meter', 'kilogram', 'foot']
   */
  ['unit-id']?: string[];

  /**
   * Number system names to include.
   *
   * Ex: ['latn', 'arab', 'laoo']
   */
  ['number-system-name']: string[];
}

type SchemaConfigKey = keyof SchemaConfig;

const COPY: SchemaConfigKey[] = [
  'currency-id',
  'language-id',
  'script-id',
  'region-id',
  'unit-id',
  'number-system-name'
];

export class CodeBuilder {

  private indices: { [name: string]: KeyIndex<string> } = INDICES;

  constructor(private config: SchemaConfig) { }

  /**
   * Creates the origin of the code that builds the schema accessor instance.
   */
  origin(): Origin {
    for (const key of COPY) {
      this.make(key, this.config[key] || []);
    }

    // this.make('currency-id', this.config.currencies || []);
    // this.make('unit-name', this.config.units || []);

    // for (const name of this.config.names) {
    //   switch (name) {
    //     case 'language':
    //       this.make('language-id', NAMES_INDICES['language-id'].keys);
    //       break;
    //     case 'script':
    //       this.make('script-id', NAMES_INDICES['script-id'].keys);
    //       break;
    //     case 'region':
    //       this.make('region-id', NAMES_INDICES['region-id'].keys);
    //       break;
    //   }
    // }

    const code: any[] = [
      NAMES,
      NUMBERS,
      DATEFIELDS,
      LAYOUT,
      LIST_PATTERNS,
      BUDDHIST,
      GREGORIAN,
      JAPANESE,
      PERSIAN,
      TIMEZONE,
      CURRENCIES,
      UNITS,
      CONTEXT_TRANSFORM
    ];

    for (const name of this.config.calendars || ['gregorian']) {
      switch (name) {
        case 'gregorian':
          this.add(GREGORIAN_INDICES);
          break;
        case 'buddhist':
          this.add(BUDDHIST_INDICES);
          break;
        case 'japanese':
          this.add(JAPANESE_INDICES);
          break;
        case 'persian':
          this.add(PERSIAN_INDICES);
          break;
      }
    }

    return origin(code, this.indices);
  }

  /**
   * Set the key index with the given name.
   */
  private make(name: string, keys: string[]): void {
    this.indices[name] = new KeyIndex<string>(keys);
  }

  private add(indices: KeyIndexMap): void {
    const names = Object.keys(indices);
    for (const name of names) {
      this.indices[name] = indices[name];
    }
  }
}

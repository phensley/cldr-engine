import { origin, KeyIndex, KeyIndexMap, Origin } from '../types';
import { BUDDHIST, BUDDHIST_INDICES } from './buddhist';
import { CALENDAR_INDICES } from './calendars';
import { CURRENCIES } from './currencies';
import { DATEFIELDS, DATEFIELDS_INDICES } from './datefields';
import { CONTEXT_TRANSFORM, GENERAL_INDICES, LAYOUT, LIST_PATTERNS } from './general';
import { GREGORIAN, GREGORIAN_INDICES } from './gregorian';
import { JAPANESE, JAPANESE_INDICES } from './japanese';
import { NAMES } from './names';
import { NUMBERS, NUMBERS_INDICES } from './numbers';
import { PERSIAN, PERSIAN_INDICES } from './persian';
import { TIMEZONE, TIMEZONE_INDICES } from './timezones';
import { UNITS } from './units';

import { AltIndex, PluralIndex } from '../schema';

const EMPTY_INDEX = new KeyIndex([]);

const emptyCalendarIndex = (name: string): KeyIndexMap => ({
  [`${name}-available-format`]: EMPTY_INDEX,
  [`${name}-plural-format`]: EMPTY_INDEX,
  [`${name}-era`]: EMPTY_INDEX,
  [`${name}-interval-format`]: EMPTY_INDEX,
  [`${name}-month`]: EMPTY_INDEX
});

export interface SchemaConfig {
  /**
   * Calendar types to include.
   *
   * Ex: ['gregorian', 'buddhist', 'japanese', 'persian']
   */
  calendars?: string[];

  /**
   * Control which Gregorian skeleton date time formats are available at runtime.
   */
  ['gregorian-available-format']?: string[];
  ['gregorian-plural-format']?: string[];

  ['buddhist-available-format']?: string[];
  ['buddhist-plural-format']?: string[];

  ['japanese-available-format']?: string[];
  ['japanese-plural-format']?: string[];

  ['persian-available-format']?: string[];
  ['persian-plural-format']?: string[];

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
   * CLDR stable timezone identifiers to include.
   *
   * Ex: ['America/New_York', 'America/Adak', ... ]
   */
  ['timezone-id']?: string[];

  /**
   * Number system names to include, in addition to 'latn' which
   * must always be defined.
   *
   * Ex: ['arab', 'laoo']
   */
  ['number-system-name']?: string[];
}

type SchemaConfigKey = keyof SchemaConfig;

const COPY: SchemaConfigKey[] = [
  'currency-id',
  'language-id',
  'script-id',
  'region-id',
  'unit-id',
  'timezone-id'
];

export class CodeBuilder {

  private indices: { [name: string]: KeyIndex<string> } = {
    'alt-key': AltIndex,
    'plural-key': PluralIndex,
    ...CALENDAR_INDICES,
    ...GREGORIAN_INDICES,
    ...emptyCalendarIndex('buddhist'),
    ...emptyCalendarIndex('japanese'),
    ...emptyCalendarIndex('persian'),
    ...DATEFIELDS_INDICES,
    ...GENERAL_INDICES,
    ...NUMBERS_INDICES,
    ...TIMEZONE_INDICES,
  };

  constructor(private config: SchemaConfig) { }

  /**
   * Creates the origin of the code that builds the schema accessor instance.
   */
  origin(): Origin {
    for (const key of COPY) {
      this.make(key, this.config[key] || []);
    }

    // Ensure 'latn' is always defined since its our fallback
    let numberSystemNames = this.config['number-system-name'] || [];
    if (numberSystemNames.indexOf('latn') === -1) {
      numberSystemNames = numberSystemNames.concat(['latn']);
    }
    this.make('number-system-name', numberSystemNames);

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

    // Always define at least one date and one time skeleton format.
    const availableFormats: string[] = []; // ['yyyyMMMd', 'Hms'];
    for (const name of this.config.calendars || []) {
      switch (name) {
        case 'buddhist':
          this.add(BUDDHIST_INDICES);
          this.copy('buddhist-available-format', availableFormats);
          this.copy('buddhist-plural-format', availableFormats);
          break;
        case 'japanese':
          this.add(JAPANESE_INDICES);
          this.copy('japanese-available-format', availableFormats);
          this.copy('japanese-plural-format', availableFormats);
          break;
        case 'persian':
          this.add(PERSIAN_INDICES);
          this.copy('persian-available-format', availableFormats);
          this.copy('persian-plural-format', availableFormats);
          break;
      }
    }

    this.copy('gregorian-available-format', availableFormats); // ['yMd', 'Hmsv']);
    this.copy('gregorian-plural-format', []);
    return origin(code, this.indices);
  }

  /**
   * Set the key index with the given name.
   */
  private make(name: string, keys: string[]): void {
    this.indices[name] = new KeyIndex<string>(keys);
  }

  private copy(name: SchemaConfigKey, defaults: string[]): void {
    const vals = this.config[name];
    this.indices[name] = new KeyIndex<string>(vals && vals.length > 0 ? vals : defaults);
  }

  private add(indices: KeyIndexMap): void {
    const names = Object.keys(indices);
    for (const name of names) {
      this.indices[name] = indices[name];
    }
  }
}

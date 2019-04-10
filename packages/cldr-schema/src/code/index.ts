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
  [`${name}-era`]: EMPTY_INDEX,
  [`${name}-interval-format`]: EMPTY_INDEX,
  [`${name}-month`]: EMPTY_INDEX
});

const INDICES = {
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
   * CLDR stable timezone identifiers to include.
   *
   * Ex: ['America/New_York', 'America/Adak', ... ]
   */
  ['timezone-id']?: string[];

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
  'timezone-id'
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

    // Ensure 'latn' is always defined since its our fallback
    let numberSystemNames = this.config['number-system-name'] || [];
    if (numberSystemNames.indexOf('latn') === -1) {
      numberSystemNames = numberSystemNames.concat(['latn']).sort();
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

    for (const name of this.config.calendars || []) {
      switch (name) {
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

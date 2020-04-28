import { KeyIndex, KeyIndexMap } from '@phensley/cldr-types';
import { origin, KeyIndexImpl, Origin } from '../instructions';
import {
  BUDDHIST,
  BUDDHIST_INDICES,
  CALENDAR_INDICES,
  GREGORIAN,
  GREGORIAN_INDICES,
  JAPANESE,
  JAPANESE_INDICES,
  PERSIAN,
  PERSIAN_INDICES,
} from './calendars';
import { CURRENCIES } from './currencies';
import { DATEFIELDS, DATEFIELDS_INDICES } from './datefields';
import { CONTEXT_TRANSFORM, GENERAL_INDICES, LAYOUT, LIST_PATTERNS } from './general';
import { NAMES } from './names';
import { NUMBERS, NUMBERS_INDICES } from './numbers';
import { TIMEZONE, TIMEZONE_INDICES } from './timezones';
import { UNITS } from './units';

import { AltIndex, DayPeriodAltIndex, EraAltIndex, PluralIndex } from '../schema';

const EMPTY_INDEX = new KeyIndexImpl([]);

const emptyCalendarIndex = (name: string): KeyIndexMap => ({
  [`${name}-available-format`]: EMPTY_INDEX,
  [`${name}-plural-format`]: EMPTY_INDEX,
  [`${name}-era`]: EMPTY_INDEX,
  [`${name}-interval-format`]: EMPTY_INDEX,
  [`${name}-month`]: EMPTY_INDEX
});

/**
 * @public
 */
export interface SchemaConfig {
  /**
   * Calendar types to include. Note that 'gregory' for the
   * gregorian calendar will be included by default, even if
   * omitted from this list.
   *
   * Ex: ['buddhist', 'japanese', 'persian']
   */
  calendars?: string[];

  /**
   * Control which skeleton date time formats are available at runtime.
   */
  ['gregorian-available-format']?: string[];
  ['gregorian-plural-format']?: string[];
  ['gregorian-interval-format']?: string[];

  ['buddhist-available-format']?: string[];
  ['buddhist-plural-format']?: string[];
  ['buddhist-interval-format']?: string[];

  ['japanese-available-format']?: string[];
  ['japanese-plural-format']?: string[];
  ['japanese-interval-format']?: string[];

  ['persian-available-format']?: string[];
  ['persian-plural-format']?: string[];
  ['persian-interval-format']?: string[];

  /**
   * Currency codes to include.
   *
   * Ex: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', ... ]
   */
  ['currency-id']?: string[];

  /**
   * Language identifiers to include. This only controls
   * inclusion of language display name data.
   */
  ['language-id']?: string[];

  /**
   * Script identifiers to include. This only controls
   * inclusion of script display name data.
   */
  ['script-id']?: string[];

  /**
   * Region identifiers to include. This only controls
   * inclusion of region display name data.
   */
  ['region-id']?: string[];

  /**
   * Units to include.
   *
   * Ex: ['meter', 'kilogram', 'foot']
   */
  ['unit-id']?: string[];

  /**
   * CLDR stable timezone identifiers to include. This only
   * controls inclusion of exemplar city data. All timezone
   * ids and offset data will work even if this array is
   * empty.
   *
   * Ex: ['America/New_York', 'America/Adak', ... ]
   */
  ['timezone-id']?: string[];

  /**
   * Number system names to include. Note that 'latn' will be
   * included by default, even if omitted from this list.
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

/**
 * @public
 */
export class CodeBuilder {

  private indices: { [name: string]: KeyIndex<string> } = {
    'alt-key': AltIndex,
    'day-period-alt-key': DayPeriodAltIndex,
    'era-alt-key': EraAltIndex,
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

    for (const name of this.config.calendars || []) {
      switch (name) {
        case 'buddhist':
          this.add(BUDDHIST_INDICES);
          this.copy('buddhist-available-format');
          this.copy('buddhist-plural-format');
          this.copy('buddhist-interval-format');
          break;
        case 'japanese':
          this.add(JAPANESE_INDICES);
          this.copy('japanese-available-format');
          this.copy('japanese-plural-format');
          this.copy('japanese-interval-format');
          break;
        case 'persian':
          this.add(PERSIAN_INDICES);
          this.copy('persian-available-format');
          this.copy('persian-plural-format');
          this.copy('persian-interval-format');
          break;
      }
    }

    this.copy('gregorian-available-format');
    this.copy('gregorian-plural-format');
    this.copy('gregorian-interval-format');
    return origin(code, this.indices);
  }

  /**
   * Set the key index with the given name.
   */
  private make(name: string, keys: string[]): void {
    this.indices[name] = new KeyIndexImpl<string>(keys);
  }

  private copy(name: SchemaConfigKey): void {
    this.indices[name] = new KeyIndexImpl<string>(this.config[name] || []);
  }

  private add(indices: KeyIndexMap): void {
    const names = Object.keys(indices);
    for (const name of names) {
      this.indices[name] = indices[name];
    }
  }
}

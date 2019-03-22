import { origin, Origin } from '../types';
import { BUDDHIST, BUDDHIST_INDICES } from './buddhist';
import { CALENDAR_INDICES, CALENDAR_VALUES } from './calendars';
import { CURRENCIES, CURRENCIES_INDICES, CURRENCIES_VALUES } from './currencies';
import { DATEFIELDS, DATEFIELDS_INDICES } from './datefields';
import { CONTEXT_TRANSFORM, GENERAL_INDICES, LAYOUT, LIST_PATTERNS } from './general';
import { GREGORIAN, GREGORIAN_INDICES } from './gregorian';
import { JAPANESE, JAPANESE_INDICES } from './japanese';
import { NAMES, NAMES_INDICES } from './names';
import { NUMBERS, NUMBERS_INDICES, NUMBERS_VALUES } from './numbers';
import { PERSIAN, PERSIAN_INDICES } from './persian';
import { TIMEZONE, TIMEZONE_INDICES, TIMEZONE_VALUES } from './timezones';
import { UNITS, UNITS_INDICES, UNITS_VALUES } from './units';

import { AltIndex, PluralIndex } from '../schema';

const CODE = [
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

const INDICES = {
  'alt-key': AltIndex,
  'plural-key': PluralIndex,

  ...BUDDHIST_INDICES,
  ...CALENDAR_INDICES,
  ...GREGORIAN_INDICES,
  ...JAPANESE_INDICES,
  ...PERSIAN_INDICES,

  ...CURRENCIES_INDICES,
  ...DATEFIELDS_INDICES,
  ...GENERAL_INDICES,
  ...NAMES_INDICES,
  ...NUMBERS_INDICES,
  ...TIMEZONE_INDICES,
  ...UNITS_INDICES
};

const VALUES = {
  ...CALENDAR_VALUES,
  ...CURRENCIES_VALUES,
  ...NUMBERS_VALUES,
  ...TIMEZONE_VALUES,
  ...UNITS_VALUES
};

export const ORIGIN: Origin = origin(CODE, INDICES, VALUES);

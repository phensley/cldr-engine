export * from './instructions';

import { origin, Origin } from './instructions';
import { CURRENCIES } from './currencies';
import { DATEFIELDS } from './datefields';
import { GREGORIAN } from './gregorian';
import { NUMBERS } from './numbers';
import { TERRITORIES } from './territories';
import { TIME_ZONE_NAMES } from './timezones';
import { UNITS } from './units';

export const ORIGIN: Origin = origin([
  NUMBERS,
  DATEFIELDS,
  GREGORIAN,
  CURRENCIES,
  TERRITORIES,
  TIME_ZONE_NAMES,
  UNITS
]);

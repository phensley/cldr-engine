export * from './instructions';

import { origin, Origin } from './instructions';
import { CURRENCIES } from './currencies';
import { GREGORIAN } from './gregorian';
import { NUMBERS } from './numbers';
import { TIME_ZONE_NAMES } from './timezones';
import { UNITS } from './units';

export const ORIGIN = origin([
  NUMBERS,
  GREGORIAN,
  CURRENCIES,
  TIME_ZONE_NAMES,
  UNITS
]);

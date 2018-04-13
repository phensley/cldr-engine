export * from './instructions';

import { origin, Origin } from './instructions';
import { CURRENCIES } from './currencies';
import { DATEFIELDS } from './datefields';
import { LAYOUT, LIST_PATTERNS } from './general';
import { GREGORIAN } from './gregorian';
import { NAMES } from './names';
import { NUMBERS } from './numbers';
import { PERSIAN } from './persian';
import { TIME_ZONE_NAMES } from './timezones';
import { UNITS } from './units';

export const ORIGIN: Origin = origin([
  NAMES,
  NUMBERS,
  DATEFIELDS,
  LAYOUT,
  LIST_PATTERNS,
  GREGORIAN,
  PERSIAN,
  CURRENCIES,
  TIME_ZONE_NAMES,
  UNITS
]);

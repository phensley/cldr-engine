export * from './instructions';

import { origin, Origin } from './instructions';
import { CURRENCIES } from './currencies';
import { DATEFIELDS } from './datefields';
import { LAYOUT } from './general';
import { GREGORIAN } from './gregorian';
import { NAMES } from './names';
import { NUMBERS } from './numbers';
import { TIME_ZONE_NAMES } from './timezones';
import { UNITS } from './units';

export const ORIGIN: Origin = origin([
  NAMES,
  NUMBERS,
  DATEFIELDS,
  LAYOUT,
  GREGORIAN,
  CURRENCIES,
  TIME_ZONE_NAMES,
  UNITS
]);

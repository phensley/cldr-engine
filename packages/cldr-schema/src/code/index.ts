import { origin, Origin } from '../types';
import { CURRENCIES } from './currencies';
import { DATEFIELDS } from './datefields';
import { LAYOUT, LIST_PATTERNS } from './general';
import { GREGORIAN } from './gregorian';
import { JAPANESE } from './japanese';
import { NAMES } from './names';
import { NUMBERS } from './numbers';
import { PERSIAN } from './persian';
import { TIMEZONE } from './timezones';
import { UNITS } from './units';

export const ORIGIN: Origin = origin([
  NAMES,
  NUMBERS,
  DATEFIELDS,
  LAYOUT,
  LIST_PATTERNS,
  GREGORIAN,
  JAPANESE,
  PERSIAN,
  CURRENCIES,
  TIMEZONE,
  UNITS,
]);

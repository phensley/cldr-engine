import {
  // GregorianAvailableFormatIndex,
  GregorianEraIndex,
  GregorianIntervalFormatIndex,
  GregorianMonthsIndex
} from '../schema';

import { calendarScope } from './common';
import { KeyIndexMap } from '../types';

export const GREGORIAN = calendarScope('gregorian', 'Gregorian');

export const GREGORIAN_INDICES: KeyIndexMap = {
  // 'gregorian-available-format': GregorianAvailableFormatIndex,
  'gregorian-era': GregorianEraIndex,
  'gregorian-interval-format': GregorianIntervalFormatIndex,
  'gregorian-month': GregorianMonthsIndex
};

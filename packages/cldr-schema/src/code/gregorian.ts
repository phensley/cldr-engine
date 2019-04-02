import {
  GregorianAvailableFormatIndex,
  GregorianEraIndex,
  GregorianIntervalFormatIndex,
  GregorianMonthsIndex
} from '../schema';

import { calendarScope } from './common';

export const GREGORIAN = calendarScope('gregorian', 'Gregorian');

export const GREGORIAN_INDICES = {
  'gregorian-available-format': GregorianAvailableFormatIndex,
  'gregorian-era': GregorianEraIndex,
  'gregorian-interval-format': GregorianIntervalFormatIndex,
  'gregorian-month': GregorianMonthsIndex
};

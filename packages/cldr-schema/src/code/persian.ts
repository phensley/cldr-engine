import {
  GregorianMonthsIndex,
  // PersianAvailableFormatIndex,
  PersianEraIndex,
  PersianIntervalFormatIndex,
} from '../schema';

import { calendarScope } from './common';
import { KeyIndexMap } from '../types';

export const PERSIAN = calendarScope('persian', 'Persian');

export const PERSIAN_INDICES: KeyIndexMap = {
  // 'persian-available-format': PersianAvailableFormatIndex,
  'persian-era': PersianEraIndex,
  'persian-interval-format': PersianIntervalFormatIndex,
  'persian-month': GregorianMonthsIndex
};

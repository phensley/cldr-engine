import { field, scope, vector1, vector2, Scope } from '../types';

import {
  GregorianMonthsIndex,
  PersianAvailableFormatIndex,
  PersianEraIndex,
  PersianIntervalFormatIndex,
} from '../schema';

import { calendarScope } from './common';

export const PERSIAN = calendarScope('persian', 'Persian');

export const PERSIAN_INDICES = {
  'persian-available-format': PersianAvailableFormatIndex,
  'persian-era': PersianEraIndex,
  'persian-interval-format': PersianIntervalFormatIndex,
  'persian-month': GregorianMonthsIndex
};

import {
  // BuddhistAvailableFormatIndex,
  BuddhistEraIndex,
  BuddhistIntervalFormatIndex,
  GregorianMonthsIndex
} from '../schema';

import { calendarScope } from './common';
import { KeyIndexMap } from '../types';

export const BUDDHIST = calendarScope('buddhist', 'Buddhist');

export const BUDDHIST_INDICES: KeyIndexMap = {
  // 'buddhist-available-format': BuddhistAvailableFormatIndex,
  'buddhist-era': BuddhistEraIndex,
  'buddhist-interval-format': BuddhistIntervalFormatIndex,
  'buddhist-month': GregorianMonthsIndex
};
